import cron from "node-cron";
import { prisma } from "../lib/prisma.js";

export const startCronJobs = () => {
  console.log("⏳ Robot Transaksi (Cron) telah aktif...");

  // 🤖 ROBOT 1: Cek setiap 1 Menit untuk Transaksi Kedaluwarsa (2 Jam)
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      // Cari status 'pending' yang waktunya sudah melewati 'expires_at'
      const expired = await prisma.transactions.updateMany({
        where: {
          status: "pending",
          expires_at: { lt: now }, // Jika expires_at lebih kecil (lebih lama) dari waktu sekarang
        },
        data: { status: "expired" }, // Status 5: Kedaluwarsa
      });

      if (expired.count > 0) {
        console.log(
          `❌ Menghanguskan ${expired.count} transaksi (Lewat batas 2 jam).`,
        );
      }
    } catch (error) {
      console.error("Cron Expired Error:", error);
    }
  });

  // 🤖 ROBOT 2: Cek setiap 1 Jam untuk Pembatalan Otomatis (3 Hari tidak direspon Admin)
  cron.schedule("0 * * * *", async () => {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Cari status 'waiting_admin' yang terakhir di-update 3 hari yang lalu
      const cancelled = await prisma.transactions.updateMany({
        where: {
          status: "waiting_admin",
          updated_at: { lt: threeDaysAgo },
        },
        data: { status: "cancelled" }, // Status 6: Dibatalkan
      });

      if (cancelled.count > 0) {
        console.log(
          `⚠️ Membatalkan ${cancelled.count} transaksi (Organizer tidak merespon dalam 3 hari).`,
        );
      }
    } catch (error) {
      console.error("Cron Cancelled Error:", error);
    }
  });
};
