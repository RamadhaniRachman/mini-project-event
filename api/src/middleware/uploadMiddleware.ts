import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import "dotenv/config";

// 1. Konfigurasi Kunci Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("=== STATUS CLOUDINARY ===");
console.log(process.env.CLOUDINARY_CLOUD_NAME ? "✅ Terhubung" : "❌ Gagal");

// 2. Buat Gudang Penyimpanan Dinamis
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    // Tentukan nama folder berdasarkan jalur URL (endpoint) yang diakses
    let folderName = "neon_stage/lainnya"; // Default

    // Jika endpoint mengandung "/events", masuk ke folder events
    if (req.baseUrl.includes("/events")) {
      folderName = "neon_stage/events";
    }
    // Jika endpoint mengandung "/auth" atau "/profile", masuk ke folder avatars
    else if (
      req.baseUrl.includes("/auth") ||
      req.originalUrl.includes("/profile")
    ) {
      folderName = "neon_stage/avatars";
    }
    // Jika endpoint mengandung "/transactions", masuk ke folder payments
    else if (req.baseUrl.includes("/transactions")) {
      folderName = "neon_stage/payments";
    }

    return {
      folder: folderName,
      allowed_formats: ["jpg", "jpeg", "png", "webp"], // Format aman
      // Opsional: Anda bisa menambahkan kompresi di sini jika mau
      // transformation: [{ width: 1000, crop: "limit" }]
    };
  },
});

// 3. Export Multer Siap Pakai (Namanya kita bedakan agar tidak bingung)
export const uploadCloud = multer({ storage: storage });
