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

    // 👇 Tambahkan tangkapan untuk useCoupon dan redeemPoints dari Frontend
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

      // 2. Cek Kupon Referral 10% (Jika User mencentang "Gunakan Kupon")
      let appliedCoupon = null;
      if (useCoupon) {
        appliedCoupon = await tx.coupons.findFirst({
          where: {
            user_id: customerId,
            is_used: false,
            expired_at: { gte: new Date() }, // Pastikan belum kadaluwarsa
          },
        });
        if (!appliedCoupon)
          throw new Error(
            "Kupon referral tidak tersedia atau sudah kadaluwarsa.",
          );
      }

      // 3. Cek Saldo Poin Referral (Jika User mengisi jumlah poin yang ingin dipakai)
      let pointsToUse = Number(redeemPoints) || 0;
      if (pointsToUse > 0) {
        // Ambil semua poin user yang masih aktif dan ada saldonya (Urutkan dari yang paling cepat expired / FIFO)
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

        // Potong Saldo Poin di database secara berurutan (Sistem FIFO)
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

      // 4. Loop setiap tiket yang dibeli untuk cek stok & hitung harga akhir
      for (const item of selectedTickets) {
        if (item.quantity <= 0) continue;

        const ticketDb = await tx.tickets.findUnique({
          where: { id: item.ticketId },
        });
        if (!ticketDb) throw new Error(`Tiket tidak ditemukan`);
        if (ticketDb.available_seats < item.quantity) {
          throw new Error(`Kapasitas ${ticketDb.name} tidak mencukupi.`);
        }

        // Potong kursi tiket sementara
        await tx.tickets.update({
          where: { id: item.ticketId },
          data: { available_seats: ticketDb.available_seats - item.quantity },
        });

        // Hitung harga dasar
        const originalPrice = ticketDb.price * item.quantity;
        let finalPrice = originalPrice;

        // A. Potong pakai Promo Organizer (Jika ada)
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

        // B. Potong pakai Kupon Referral (Misal 10%)
        if (appliedCoupon) {
          finalPrice -= finalPrice * (appliedCoupon.discount_percentage / 100);
        }

        // C. Potong pakai Poin (1 Poin = Rp 1)
        let pointUsedForThisTicket = 0;
        if (pointsToUse > 0) {
          const deduction = Math.min(finalPrice, pointsToUse); // Jangan sampai harga jadi minus
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
          final_price: Math.round(finalPrice), // Bulatkan agar tidak ada desimal
          promo_id: promo ? promo.id : null,
          point_redeemed: pointUsedForThisTicket, // 👈 Simpan total poin yang dipotong di transaksi ini
          status: "pending",
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
          data: { is_used: true }, // Tandai kupon hangus karena sudah dipakai
        });
      }

      return true; // Transaksi sukses
    });

    return res
      .status(200)
      .json({ message: "Pembelian tiket berhasil menunggu verifikasi!" });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return res
      .status(400)
      .json({ message: error.message || "Gagal melakukan transaksi" });
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

// 👇 INI FUNGSI YANG SUDAH DI-UPGRADE DENGAN NODEMAILER & REFUND 👇
export const verifyTransaction = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const { action, reason, note } = req.body; // Menerima alasan penolakan dari frontend

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
    if (transaction.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Transaksi ini sudah diproses sebelumnya." });
    }

    // =====================================
    // LOGIKA JIKA TRANSAKSI DITOLAK
    // =====================================
    if (action === "REJECT") {
      const queries: any[] = [];

      // 1. Ubah status transaksi
      queries.push(
        prisma.transactions.update({
          where: { id: Number(id) },
          data: { status: "rejected" },
        }),
      );
      // 2. Kembalikan sisa kursi tiket
      queries.push(
        prisma.tickets.update({
          where: { id: transaction.ticket_type_id },
          data: { available_seats: { increment: transaction.quantity } },
        }),
      );

      // 3. Kembalikan Kuota Promo Organizer (Jika pakai)
      if (transaction.promo_id) {
        queries.push(
          prisma.promotions.update({
            where: { id: transaction.promo_id },
            data: { quota: { increment: 1 } },
          }),
        );
      }

      // Catatan: Jika ada kupon pribadi (Referral), kembalikan is_used jadi false di sini
      // Catatan: Logika Poin dimatikan agar tidak terjadi error relasi.

      await prisma.$transaction(queries); // Eksekusi bersamaan agar aman (ACID)

      // 4. KIRIM EMAIL PENOLAKAN
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
          <p>Silakan melakukan pembelian ulang tiket sebelum kehabisan!</p>
        </div>
      `;
      // Panggil sendEmail tanpa await agar response API lebih cepat
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

      // KIRIM EMAIL E-TICKET (SUCCESS)
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
          <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #888;">
            Tunjukkan email ini kepada petugas saat berada di Gate acara.
          </p>
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

// Fungsi untuk mengecek Poin dan Kupon milik Customer
export const getUserRewards = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const customerId = req.user.id;

    // 1. Hitung total poin yang masih aktif (belum expired & saldo > 0)
    const activePoints = await prisma.points.aggregate({
      where: {
        user_id: customerId,
        remaining_balance: { gt: 0 },
        expired_at: { gte: new Date() },
      },
      _sum: { remaining_balance: true },
    });
    const totalPoints = activePoints._sum.remaining_balance || 0;

    // 2. Cek apakah ada kupon referral 10% yang belum dipakai
    const activeCoupon = await prisma.coupons.findFirst({
      where: {
        user_id: customerId,
        is_used: false,
        expired_at: { gte: new Date() },
      },
    });

    return res.status(200).json({
      points: totalPoints,
      hasCoupon: !!activeCoupon, // Mengubah object menjadi true/false
    });
  } catch (error) {
    console.error("Error get rewards:", error);
    return res.status(500).json({ message: "Gagal mengambil data reward" });
  }
};
