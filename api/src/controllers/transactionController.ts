import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { CustomRequest } from "../middleware/authMiddleware.js";
import { sendEmail } from "../utils/mailer.js";

export const checkout = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const customerId = req.user.id;

    // Tambahkan tangkapan untuk useCoupon dan redeemPoints dari Frontend
    const { eventId, selectedTickets, promoCode, useCoupon, redeemPoints } =
      req.body;

    if (!selectedTickets || selectedTickets.length === 0) {
      return res.status(400).json({ message: "Tidak ada tiket yang dipilih" });
    }

    const result = await prisma.$transaction(async (tx) => {
      let promo = null;

      // 1. Cek Kode Promo dari Organizer (Jika ada)
      if (promoCode) {
        promo = await tx.promotions.findFirst({
          where: {
            promo_code: promoCode.toUpperCase(),
            event_id: Number(eventId),
            valid_from: { lte: new Date() },
            valid_until: { gte: new Date() },
            quota: { gt: 0 },
          },
        });
        if (!promo) throw new Error("Kode promo tidak valid atau kuota habis.");
      }

      // 2. Cek Kupon Referral 10%
      let appliedCoupon = null;
      if (useCoupon) {
        appliedCoupon = await tx.coupons.findFirst({
          where: {
            user_id: customerId,
            is_used: false,
            expired_at: { gte: new Date() },
          },
        });
        if (!appliedCoupon)
          throw new Error(
            "Kupon referral tidak tersedia atau sudah kadaluwarsa.",
          );
      }

      // 3. Cek Saldo Poin Referral
      let pointsToUse = Number(redeemPoints) || 0;
      if (pointsToUse > 0) {
        const activePoints = await tx.points.findMany({
          where: {
            user_id: customerId,
            remaining_balance: { gt: 0 },
            expired_at: { gte: new Date() },
          },
          orderBy: { expired_at: "asc" },
        });

        const totalBalance = activePoints.reduce(
          (sum, p) => sum + p.remaining_balance,
          0,
        );
        if (totalBalance < pointsToUse) {
          throw new Error(
            `Saldo poin tidak mencukupi. Saldo maksimal Anda: ${totalBalance}`,
          );
        }

        let remainingToDeduct = pointsToUse;
        for (const pointRow of activePoints) {
          if (remainingToDeduct <= 0) break;

          const deductAmount = Math.min(
            pointRow.remaining_balance,
            remainingToDeduct,
          );
          await tx.points.update({
            where: { id: pointRow.id },
            data: {
              remaining_balance: pointRow.remaining_balance - deductAmount,
            },
          });
          remainingToDeduct -= deductAmount;
        }
      }

      const transactionsToCreate = [];

      // 👇 WAKTU KEDALUWARSA: 2 JAM DARI SEKARANG
      const duaJamDariSekarang = new Date(Date.now() + 2 * 60 * 60 * 1000);

      // 4. Loop setiap tiket
      for (const item of selectedTickets) {
        if (item.quantity <= 0) continue;

        const ticketDb = await tx.tickets.findUnique({
          where: { id: item.ticketId },
        });
        if (!ticketDb) throw new Error(`Tiket tidak ditemukan`);
        if (ticketDb.available_seats < item.quantity) {
          throw new Error(`Kapasitas ${ticketDb.name} tidak mencukupi.`);
        }

        await tx.tickets.update({
          where: { id: item.ticketId },
          data: { available_seats: ticketDb.available_seats - item.quantity },
        });

        const originalPrice = ticketDb.price * item.quantity;
        let finalPrice = originalPrice;

        if (promo) {
          if (promo.discount_type === "PERCENTAGE") {
            finalPrice -= originalPrice * (promo.discount_value / 100);
          } else {
            finalPrice = Math.max(
              0,
              originalPrice - promo.discount_value * item.quantity,
            );
          }
        }

        if (appliedCoupon) {
          finalPrice -= finalPrice * (appliedCoupon.discount_percentage / 100);
        }

        let pointUsedForThisTicket = 0;
        if (pointsToUse > 0) {
          const deduction = Math.min(finalPrice, pointsToUse);
          finalPrice -= deduction;
          pointsToUse -= deduction;
          pointUsedForThisTicket = deduction;
        }

        transactionsToCreate.push({
          customer_id: customerId,
          event_id: Number(eventId),
          ticket_type_id: item.ticketId,
          quantity: item.quantity,
          original_price: originalPrice,
          final_price: Math.round(finalPrice),
          promo_id: promo ? promo.id : null,
          point_redeemed: pointUsedForThisTicket,
          status: "pending",
          expires_at: duaJamDariSekarang, // 👈 TAMBAHAN: Set timer 2 jam
        });
      }

      // 5. Insert semua transaksi
      await tx.transactions.createMany({ data: transactionsToCreate });

      // 6. Update Status Kuota & Kupon
      if (promo) {
        await tx.promotions.update({
          where: { id: promo.id },
          data: { quota: promo.quota - 1 },
        });
      }

      if (appliedCoupon) {
        await tx.coupons.update({
          where: { id: appliedCoupon.id },
          data: { is_used: true },
        });
      }

      return true;
    });

    return res.status(201).json({
      message:
        "Pembelian tiket berhasil! Silakan unggah bukti pembayaran dalam waktu 2 jam.",
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return res
      .status(400)
      .json({ message: error.message || "Gagal melakukan transaksi" });
  }
};

// 👇 FUNGSI BARU UNTUK CUSTOMER UPLOAD BUKTI PEMBAYARAN 👇
export const uploadProof = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const transactionId = Number(req.params.id);
    const userId = req.user.id;

    // Pastikan file gambar berhasil ditangkap multer/cloudinary
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "File bukti pembayaran tidak ditemukan." });
    }

    const imageUrl = req.file.path; // URL otomatis dari Cloudinary

    const transaction = await prisma.transactions.findFirst({
      where: { id: transactionId, customer_id: userId },
    });

    if (!transaction)
      return res.status(404).json({ message: "Transaksi tidak ditemukan." });

    // Hanya bisa upload jika statusnya pending atau rejected (ditolak tapi boleh re-upload)
    if (transaction.status !== "pending" && transaction.status !== "rejected") {
      return res.status(400).json({
        message: `Tidak bisa mengunggah bukti. Status saat ini: ${transaction.status}`,
      });
    }

    const updatedTransaction = await prisma.transactions.update({
      where: { id: transactionId },
      data: {
        payment_proof: imageUrl,
        status: "waiting_admin", // Ubah status agar masuk antrean Organizer
      },
    });

    return res.status(200).json({
      message: "Bukti pembayaran berhasil diunggah! Menunggu konfirmasi admin.",
      data: updatedTransaction,
    });
  } catch (error) {
    console.error("Upload proof error:", error);
    return res
      .status(500)
      .json({ message: "Gagal mengunggah bukti pembayaran." });
  }
};

export const getOrganizerTransactions = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const organizerId = req.user.id;

    const transactions = await prisma.transactions.findMany({
      where: { event: { organizer_id: organizerId } },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true } },
        ticket_type: { select: { name: true } },
      },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ data: transactions });
  } catch (error) {
    console.error("Error get transactions:", error);
    return res.status(500).json({ message: "Gagal mengambil data transaksi" });
  }
};

export const validatePromo = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const { promoCode, eventId } = req.body;

    const promo = await prisma.promotions.findFirst({
      where: {
        promo_code: promoCode.toUpperCase(),
        event_id: Number(eventId),
        valid_from: { lte: new Date() },
        valid_until: { gte: new Date() },
        quota: { gt: 0 },
      },
    });

    if (!promo) {
      return res.status(404).json({
        message: "Kode promo tidak valid, kadaluwarsa, atau kuota habis.",
      });
    }

    return res.status(200).json({ message: "Promo valid", data: promo });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat memvalidasi promo." });
  }
};

export const getTransactionById = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const transaction = await prisma.transactions.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true } },
        ticket_type: { select: { name: true } },
      },
    });

    if (!transaction)
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    return res.status(200).json({ data: transaction });
  } catch (error) {
    return res.status(500).json({ message: "Gagal memuat detail transaksi" });
  }
};

export const verifyTransaction = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const { action, reason, note } = req.body;

    const transaction = await prisma.transactions.findUnique({
      where: { id: Number(id) },
      include: {
        user: true,
        event: true,
        ticket_type: true,
      },
    });

    if (!transaction)
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });

    // 👇 PASTIKAN ORGANIZER HANYA MEMPROSES YANG MENUNGGU KONFIRMASI
    if (transaction.status !== "waiting_admin") {
      return res.status(400).json({
        message: "Transaksi ini tidak sedang menunggu konfirmasi admin.",
      });
    }

    // =====================================
    // LOGIKA JIKA TRANSAKSI DITOLAK
    // =====================================
    if (action === "REJECT") {
      const queries: any[] = [];

      queries.push(
        prisma.transactions.update({
          where: { id: Number(id) },
          data: { status: "rejected" },
        }),
      );

      queries.push(
        prisma.tickets.update({
          where: { id: transaction.ticket_type_id },
          data: { available_seats: { increment: transaction.quantity } },
        }),
      );

      if (transaction.promo_id) {
        queries.push(
          prisma.promotions.update({
            where: { id: transaction.promo_id },
            data: { quota: { increment: 1 } },
          }),
        );
      }

      await prisma.$transaction(queries);

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #FF8FC7; border-radius: 10px; padding: 20px;">
          <h2 style="color: #ef4444; text-align: center;">Transaksi Ditolak</h2>
          <p>Halo <strong>${transaction.user.name}</strong>,</p>
          <p>Mohon maaf, transaksi Anda (ID: #TRX-${transaction.id.toString().padStart(5, "0")}) untuk event <strong>${transaction.event.title}</strong> belum dapat kami verifikasi.</p>
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <p style="margin: 0; color: #b91c1c;"><strong>Alasan Penolakan:</strong> ${reason || "Bukti Transfer Tidak Sesuai"}</p>
            ${note ? `<p style="margin: 10px 0 0; color: #7f1d1d;"><strong>Catatan Admin:</strong> ${note}</p>` : ""}
          </div>
          <p>Seluruh voucher yang Anda gunakan pada transaksi ini telah <strong>dikembalikan secara otomatis</strong> ke akun Anda.</p>
        </div>
      `;
      sendEmail(
        transaction.user.email,
        `[DITOLAK] Pembelian Tiket - ${transaction.event.title}`,
        emailHtml,
      );

      return res.status(200).json({
        message: "Transaksi ditolak. Kursi dan voucher berhasil dikembalikan.",
      });
    }

    // =====================================
    // LOGIKA JIKA TRANSAKSI DITERIMA
    // =====================================
    if (action === "ACCEPT") {
      await prisma.transactions.update({
        where: { id: Number(id) },
        data: { status: "success" },
      });

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; background-color: #1C1C1E; color: #fff; border-radius: 15px; padding: 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF8FC7; font-style: italic; margin: 0;">E-TICKET BERHASIL</h1>
            <p style="color: #ccc; margin-top: 5px;">ID Transaksi: #TRX-${transaction.id.toString().padStart(5, "0")}</p>
          </div>
          <div style="background-color: #2C2C2E; padding: 20px; border-radius: 10px; border-left: 5px solid #FF8FC7;">
            <h3 style="margin-top: 0; color: #fff;">${transaction.event.title}</h3>
            <p style="margin: 5px 0; color: #ccc;"><strong>Nama:</strong> ${transaction.user.name}</p>
            <p style="margin: 5px 0; color: #ccc;"><strong>Kategori:</strong> ${transaction.ticket_type.name}</p>
            <p style="margin: 5px 0; color: #ccc;"><strong>Jumlah:</strong> ${transaction.quantity} Tiket</p>
            <p style="margin: 5px 0; color: #FF8FC7;"><strong>Telah Lunas:</strong> Rp ${transaction.final_price.toLocaleString("id-ID")}</p>
          </div>
        </div>
      `;
      sendEmail(
        transaction.user.email,
        `🎟️ E-Ticket Anda: ${transaction.event.title}`,
        emailHtml,
      );

      return res.status(200).json({
        message:
          "Transaksi berhasil diterima! E-Ticket telah dikirim ke email pembeli.",
      });
    }
  } catch (error) {
    console.error("Verify error:", error);
    return res.status(500).json({ message: "Gagal memverifikasi transaksi" });
  }
};

export const getUserRewards = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const customerId = req.user.id;

    const activePoints = await prisma.points.aggregate({
      where: {
        user_id: customerId,
        remaining_balance: { gt: 0 },
        expired_at: { gte: new Date() },
      },
      _sum: { remaining_balance: true },
    });
    const totalPoints = activePoints._sum.remaining_balance || 0;

    const activeCoupon = await prisma.coupons.findFirst({
      where: {
        user_id: customerId,
        is_used: false,
        expired_at: { gte: new Date() },
      },
    });

    return res.status(200).json({
      points: totalPoints,
      hasCoupon: !!activeCoupon,
    });
  } catch (error) {
    console.error("Error get rewards:", error);
    return res.status(500).json({ message: "Gagal mengambil data reward" });
  }
};

// Fungsi untuk Mengambil Riwayat Transaksi Customer
export const getCustomerTransactions = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const customerId = req.user.id;

    const transactions = await prisma.transactions.findMany({
      where: { customer_id: customerId },
      include: {
        event: {
          select: {
            title: true,
            image_url: true,
            event_date: true,
            location: true,
          },
        },
        ticket_type: { select: { name: true } },
      },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ data: transactions });
  } catch (error) {
    console.error("Error get customer transactions:", error);
    return res
      .status(500)
      .json({ message: "Gagal mengambil riwayat transaksi" });
  }
};
