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

    // Menghitung data secara paralel agar lebih cepat

    const [eventCount, transactionData] = await Promise.all([
      // Menhgitung jumlah event yg dibuat organizer ini
      prisma.events.count({
        where: { organizer_id: organizerId },
      }),
      // Hitung total pendapatan dan tiket terjual dari transaksi yang sukses
      prisma.transactions.aggregate({
        where: {
          event: { organizer_id: organizerId },
          status: "success", // Menghitung transaksi yg berhasil saja
        },
        _sum: {
          final_price: true,
          quantity: true,
        },
      }),
    ]);
    return res.status(200).json({
      stats: {
        totalEvents: eventCount,
        totalRevenue: transactionData._sum.final_price || 0,
        totalTicketSold: transactionData._sum.quantity || 0,
      },
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
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Parsing multipart data (biar is_free dan tickets tidak ikut ke parse jadi string sma multer)
    // mengubah string "false"/"true" kembali menjadi boolean asli
    const parsedIsFree = is_free === "true";

    // Ubah string JSPM tiket kembali menjadi array object
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
          event_date: new Date(event_date),
          event_time: new Date(event_time),
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
