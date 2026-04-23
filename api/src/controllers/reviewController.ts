import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { CustomRequest } from "../middleware/authMiddleware.js";

// 1. CUSTOMER MENGIRIM ULASAN
export const createReview = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const customerId = req.user.id;
    const { eventId, rating, feedback, suggestions } = req.body;

    // A. Cek Event & Waktu
    const event = await prisma.events.findUnique({
      where: { id: Number(eventId) },
    });
    if (!event)
      return res.status(404).json({ message: "Event tidak ditemukan." });

    const now = new Date();
    // Jika waktu saat ini masih lebih kecil (sebelum) waktu event
    if (new Date(event.event_time) > now) {
      return res.status(400).json({
        message:
          "Anda hanya dapat memberikan ulasan setelah event selesai diselenggarakan.",
      });
    }

    // B. Cek apakah user BENAR-BENAR hadir (punya tiket sukses)
    const validTransaction = await prisma.transactions.findFirst({
      where: {
        customer_id: customerId,
        event_id: Number(eventId),
        status: "success",
      },
    });

    if (!validTransaction) {
      return res.status(403).json({
        message:
          "Anda belum membeli tiket untuk event ini, atau transaksi belum selesai.",
      });
    }

    // C. Cek agar tidak review double
    const existingReview = await prisma.reviews.findFirst({
      where: { customer_id: customerId, event_id: Number(eventId) },
    });

    if (existingReview) {
      return res.status(400).json({
        message: "Anda sudah memberikan ulasan untuk event ini sebelumnya.",
      });
    }

    // D. Simpan Ulasan
    const newReview = await prisma.reviews.create({
      data: {
        rating: Number(rating),
        feedback,
        suggestions,
        event_id: Number(eventId),
        customer_id: customerId,
      },
    });

    return res.status(201).json({
      message: "Terima kasih! Ulasan Anda berhasil dikirim.",
      data: newReview,
    });
  } catch (error) {
    console.error("Review Error:", error);
    return res.status(500).json({ message: "Gagal mengirim ulasan." });
  }
};

// 2. MENGAMBIL ULASAN & RATING PENYELENGGARA (Untuk Profil Penyelenggara)
export const getOrganizerReviews = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const organizerId = Number(req.params.organizerId);

    // Cari semua ulasan yang terhubung dengan event milik Organizer ini
    const reviews = await prisma.reviews.findMany({
      where: { event: { organizer_id: organizerId } },
      include: {
        user: { select: { name: true, avatar_url: true } },
        event: { select: { title: true } },
      },
      orderBy: { created_at: "desc" },
    });

    // Kalkulasi Rata-rata Rating
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? (
            reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews
          ).toFixed(1)
        : 0;

    return res.status(200).json({
      data: {
        organizer_id: organizerId,
        average_rating: averageRating,
        total_reviews: totalReviews,
        reviews: reviews,
      },
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);
    return res.status(500).json({ message: "Gagal mengambil data ulasan." });
  }
};
