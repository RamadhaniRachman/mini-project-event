import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Karena kita pakai TypeScript, kita harus mendefinisikan bentuk custom Request
// agar req.user tidak error saat dipanggil.

export interface CustomRequest extends Request {
  user?: any;
}

export const verifyToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): any => {
  try {
    // 1. Ambil token dari header request (format biasanya : "Bearer <token>")
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Akses ditolak. Token tidak ditemukan" });
    }

    // Pisahkan kata "Bearer" untuk mengambil token asilnya saja
    const token = authHeader.split(" ")[1];

    // 2. Pastikan secret key ada
    const secretKey = process.env.JWT_SECRET;

    if (!secretKey) {
      throw new Error("JWT_SECRET belum diatur di server");
    }

    // 3. Verifikasi keaslian token
    const decoded = jwt.verify(token, secretKey);

    // 4. Simpan data user (id dan role) darii token ke dalam request
    // Agar controller selanjutnya tau siapa yg lagi login
    req.user = decoded;

    // 5. Izinkan lewat ke fungsi selanjutnya (Controller)
    next();
  } catch (error) {
    return res.status(400).json({ message: "Sesi telah kadaluwarsa" });
  }
};
