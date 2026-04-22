import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { CustomRequest } from "../middleware/authMiddleware.js";

//1. Fungsi mengambil statistik dashboard organizer
export const getDashboardStats = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const organizerId = req.user.id;

    const [eventCount, transactionData, totalSeats, recentTransactions] =
      await Promise.all([
        // 1. Menghitung jumlah event
        prisma.events.count({ where: { organizer_id: organizerId } }),

        // 2. Hitung total pendapatan, tiket terjual, dan jumlah transaksi (registrasi) dari transaksi sukses
        prisma.transactions.aggregate({
          where: { event: { organizer_id: organizerId }, status: "success" },
          _sum: { final_price: true, quantity: true },
          _count: { id: true },
        }),

        // 3. Hitung total kapasitas kursi dari semua event
        prisma.tickets.aggregate({
          where: { event: { organizer_id: organizerId } },
          _sum: { available_seats: true },
        }),

        // 4. Tarik 5 transaksi terakhir (semua status)
        prisma.transactions.findMany({
          where: { event: { organizer_id: organizerId } },
          include: {
            user: { select: { name: true, email: true } },
            event: { select: { title: true } },
            ticket_type: { select: { name: true } },
          },
          orderBy: { created_at: "desc" },
          take: 5,
        }),
      ]);

    // Kalkulasi Kapasitas
    const sold = transactionData._sum.quantity || 0;
    const available = totalSeats._sum.available_seats || 0;
    const totalCapacity = sold + available;
    const occupancyRate =
      totalCapacity > 0 ? Math.round((sold / totalCapacity) * 100) : 0;

    return res.status(200).json({
      stats: {
        totalEvents: eventCount,
        totalRevenue: transactionData._sum.final_price || 0,
        totalTicketsSold: sold,
        totalRegistrations: transactionData._count.id || 0,
        occupancyRate: occupancyRate,
      },
      recentTransactions,
    });
  } catch (error) {
    console.error("Dashboard stats error", error);
    return res.status(500).json({ message: "Gagal memuat data statistik" });
  }
};

// 2. Fungsu membuat event + tiket
export const createEvent = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    console.log("=== 1. REQUEST MASUK ===");
    console.log("Data Body (Teks):", req.body);
    console.log("Data File (Foto):", req.file);

    const organizerId = req.user.id;
    const {
      title,
      description,
      location,
      category,
      event_date,
      event_time,
      is_free,
      tickets,
    } = req.body;

    // Ambil url gambar dari multer
    // Jika ada file yg diupload maka buat url nya. Jika gk ada maka kosongkan (null)
    const imageUrl = req.file ? req.file.path : null;

    // Parsing multipart data (biar is_free dan tickets tidak ikut ke parse jadi string sma multer)
    // mengubah string "false"/"true" kembali menjadi boolean asli
    const parsedIsFree = is_free === "true";

    const parsedTickets =
      typeof tickets === "string" ? JSON.parse(tickets) : tickets;

    // Menggunakan Transaction agar jika pembuatan tiket gagal, Event tidak jadi dibuat
    const newEvent = await prisma.$transaction(async (tx) => {
      const event = await tx.events.create({
        data: {
          title,
          description,
          location,
          category,
          // event_date cukup dimasukkan langsung karena formatnya sudah "YYYY-MM-DD"
          event_date: new Date(event_date),

          // event_time digabung dulu dengan tanggal agar JS paham
          // Formatnya akan menjadi "2026-05-09T12:49:00"
          event_time: new Date(`${event_date}T${event_time}:00`),
          is_free: parsedIsFree,
          organizer_id: organizerId,
          image_url: imageUrl,
          // Membuat tiket sekaligus disini
          tickets: {
            create: parsedTickets.map((t: any) => ({
              name: t.name,
              price: parsedIsFree ? 0 : Number(t.price),
              available_seats: Number(t.available_seats),
            })),
          },
        },
        include: {
          tickets: true,
        },
      });
      return event;
    });

    return res.status(201).json({
      message: "Event dan tiket berhasil dibuat!",
      data: newEvent,
    });
  } catch (error) {
    console.error("Create Event Error:", error);
    return res.status(500).json({ message: "Gagal membuat event" });
  }
};

// 3. Fungsi mengambil daftar event milik organizer
export const getOrganizerEvents = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const organizerId = req.user.id;

    const events = await prisma.events.findMany({
      where: { organizer_id: organizerId },
      include: {
        tickets: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return res.status(200).json({
      message: "Berhasil mengambil daftar event",
      data: events,
    });
  } catch (error) {
    console.error("Get organizer events error", error);
    return res.status(500).json({ message: "Gagal memuat daftar event" });
  }
};

// 4. Fungsi untuk mengambil data 1 event (Untuk mengisi form saat baru dibuka)
export const getEventById = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const eventId = Number(req.params.id);

    const event = await prisma.events.findUnique({
      where: { id: eventId },
      include: { tickets: true }, // Jangan lupa ikut bawa data tiketnya!
    });

    if (!event) {
      return res.status(404).json({ message: "Event tidak ditemukan" });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error("Error get event:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// 5. Fungsi untuk mengupdate perubahan event (Update)
export const updateEvent = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const eventId = Number(req.params.id);
    const {
      title,
      category,
      location,
      description,
      event_date,
      event_time,
      is_direct_sale,
    } = req.body;
    const tickets = JSON.parse(req.body.tickets || "[]");

    // req.file.path sudah otomatis berupa URL link Cloudinary!
    let newImageUrl = undefined;
    if (req.file) {
      newImageUrl = req.file.path;
    }

    // b. Gunakan Prisma Transaction
    const updatedEvent = await prisma.$transaction(async (tx) => {
      // 1. Update tabel utama Event
      const eventUpdate = await tx.events.update({
        where: { id: eventId },
        data: {
          title,
          category,
          location,
          description,
          event_date: new Date(event_date),
          event_time: new Date(`${event_date}T${event_time}:00`),
          // Jika ada gambar baru dari middleware, update URL-nya
          ...(newImageUrl && { image_url: newImageUrl }),
        },
      });

      // ... (Logika Update Tiket) ...
      const incomingTicketIds = tickets
        .map((t: any) => t.id)
        .filter((id: any) => id);

      await tx.tickets.deleteMany({
        where: {
          event_id: eventId,
          id: { notIn: incomingTicketIds },
        },
      });

      for (const ticket of tickets) {
        if (ticket.id) {
          await tx.tickets.update({
            where: { id: ticket.id },
            data: {
              name: ticket.name,
              price: Number(ticket.price),
              available_seats: Number(ticket.available_seats),
            },
          });
        } else {
          await tx.tickets.create({
            data: {
              event_id: eventId,
              name: ticket.name,
              price: Number(ticket.price),
              available_seats: Number(ticket.available_seats),
            },
          });
        }
      }

      return eventUpdate;
    });

    return res
      .status(200)
      .json({ message: "Event berhasil diupdate!", data: updatedEvent });
  } catch (error) {
    console.error("Error update event:", error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengupdate event" });
  }
};

// Fungsi untuk Mengambil Daftar Peserta (Berdasarkan Transaksi Sukses)
export const getAttendees = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const organizerId = req.user.id; // ID organizer yang sedang login

    // Cari semua transaksi sukses yang event-nya dimiliki oleh organizer ini
    const attendees = await prisma.transactions.findMany({
      where: {
        event: { organizer_id: organizerId }, // Relasi ke event
        status: "success", // Pastikan hanya yang sudah bayar
      },
      include: {
        user: { select: { name: true, email: true } }, // Ambil data pembeli
        ticket_type: { select: { name: true } },
        event: { select: { title: true } }, // Ambil nama event
      },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({
      message: "Berhasil mengambil data peserta",
      data: attendees,
    });
  } catch (error) {
    console.error("Get attendees error:", error);
    return res.status(500).json({ message: "Gagal memuat daftar peserta" });
  }
};

// Fungsi untuk MENGAMBIL SEMUA EVENT untuk Publik (Tanpa Token)
export const getPublicEvents = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const events = await prisma.events.findMany({
      include: { tickets: true }, // Bawa data tiket agar kita tahu harga termurahnya
      orderBy: { created_at: "desc" }, // Tampilkan dari yang paling baru
      take: 10, // Batasi 10 event terbaru untuk halaman home
    });

    return res.status(200).json({ data: events });
  } catch (error) {
    console.error("Error get public events:", error);
    return res.status(500).json({ message: "Gagal memuat daftar event" });
  }
};

// Fungsi untuk Membuat Kode Promo (Khusus Organizer)
// Fungsi untuk Membuat Kode Promo (Khusus Organizer)
export const createPromotion = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const organizerId = req.user.id;
    const userRole = req.user.role; // 👈 Ambil role dari token JWT
    const eventId = Number(req.params.id);
    const {
      promo_code,
      discount_value,
      discount_type,
      valid_from,
      valid_until,
      quota,
    } = req.body;

    // 👇 1. "SATPAM" UTAMA: Cek apakah dia benar-benar Organizer
    if (userRole !== "organizer") {
      return res.status(403).json({
        message:
          "Akses Ditolak! Hanya Organizer yang dapat membuat kode promo.",
      });
    }

    // 2. Pastikan event ini benar-benar milik organizer yang sedang login
    const event = await prisma.events.findFirst({
      where: { id: eventId, organizer_id: organizerId },
    });

    if (!event) {
      return res
        .status(403)
        .json({ message: "Event tidak ditemukan atau bukan milik Anda." });
    }

    // 3. Pastikan kode promo belum pernah dipakai di event ini
    const existingPromo = await prisma.promotions.findFirst({
      where: { promo_code: promo_code.toUpperCase(), event_id: eventId },
    });

    if (existingPromo) {
      return res
        .status(400)
        .json({ message: "Kode promo ini sudah ada untuk event tersebut." });
    }

    // 4. Simpan promo ke database
    const newPromo = await prisma.promotions.create({
      data: {
        promo_code: promo_code.toUpperCase(),
        discount_value: Number(discount_value),
        discount_type, // "NOMINAL" atau "PERCENTAGE"
        valid_from: new Date(valid_from),
        valid_until: new Date(valid_until),
        quota: Number(quota),
        event_id: eventId,
      },
    });

    return res
      .status(201)
      .json({ message: "Kode Promo berhasil dibuat!", data: newPromo });
  } catch (error) {
    console.error("Create promo error:", error);
    return res.status(500).json({ message: "Gagal membuat kode promo" });
  }
};

// Fungsi untuk Mengambil Semua Promo Milik Organizer
export const getOrganizerPromotions = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const organizerId = req.user.id;

    // Tarik semua promosi dari event-event yang dimiliki organizer ini
    const promotions = await prisma.promotions.findMany({
      where: {
        event: { organizer_id: organizerId },
      },
      include: {
        event: { select: { title: true, image_url: true } }, // Bawa judul dan gambar event
      },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json({ data: promotions });
  } catch (error) {
    console.error("Error get promotions:", error);
    return res.status(500).json({ message: "Gagal mengambil daftar promosi" });
  }
};

// Fungsi untuk Mengambil Data Laporan Analitik
export const getOrganizerReports = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const organizerId = req.user.id;

    // 1. Ambil semua transaksi yang SUKSES
    const transactions = await prisma.transactions.findMany({
      where: { event: { organizer_id: organizerId }, status: "success" },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            image_url: true,
            event_date: true,
            location: true,
          },
        },
      },
      orderBy: { created_at: "asc" },
    });

    // 2. Kalkulasi Top Performing Events (Ranking)
    const eventStats: Record<number, any> = {};
    transactions.forEach((trx) => {
      const ev = trx.event;
      if (!eventStats[ev.id]) {
        eventStats[ev.id] = {
          id: ev.id,
          title: ev.title,
          image_url: ev.image_url,
          location: ev.location,
          date: ev.event_date,
          revenue: 0,
          tickets: 0,
        };
      }
      eventStats[ev.id].revenue += trx.final_price;
      eventStats[ev.id].tickets += trx.quantity;
    });

    // Urutkan dari pendapatan terbesar, ambil Top 3
    const topEvents = Object.values(eventStats)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 3);

    return res.status(200).json({
      data: {
        transactions, // Kirim data mentah transaksi agar frontend bisa menghitung harian/bulanan
        topEvents,
      },
    });
  } catch (error) {
    console.error("Report error:", error);
    return res.status(500).json({ message: "Gagal memuat data laporan." });
  }
};
