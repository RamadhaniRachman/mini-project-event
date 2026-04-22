import "dotenv/config";
import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// 1. Konfigurasi Kunci Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("=== CEK KUNCI CLOUDINARY ===");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);

// 2. Buat Gudang Baru di Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "noir-stage-events", // Nama folder yang akan otomatis dibuat di Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"], // Format yang diizinkan
  } as any,
});

// 3. Siapkan Kurir (Multer) dengan Gudang Baru
export const upload = multer({ storage: storage });
