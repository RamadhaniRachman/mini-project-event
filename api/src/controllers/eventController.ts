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
        totalTicketsSold: transactionData._sum.quantity || 0,
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

// 2. Fungsi untuk MENYIMPAN perubahan event (Update)
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

    // ✨ KEAJAIBAN MULTER-CLOUDINARY ✨
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
          event_date,
          event_time,
          // Jika ada gambar baru dari middleware, update URL-nya
          ...(newImageUrl && { image_url: newImageUrl }),
        },
      });

      // ... (Logika Update Tiket Cerdas TETAP SAMA seperti sebelumnya) ...
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
