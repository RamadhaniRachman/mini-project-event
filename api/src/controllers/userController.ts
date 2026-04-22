import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { CustomRequest } from "../middleware/authMiddleware.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/mailer.js";

// 1. UPDATE PROFIL (General)
export const updateProfile = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user.id;
    // Catatan: Pastikan kolom phone, bio, dan avatar_url ada di schema Prisma Anda
    const { name, phone, bio } = req.body;

    const updateData: any = { name, phone, bio };

    // Jika user mengunggah foto baru via Multer/Cloudinary
    if (req.file) {
      updateData.avatar_url = req.file.path;
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
    });

    return res
      .status(200)
      .json({ message: "Profil berhasil diperbarui!", data: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Gagal memperbarui profil" });
  }
};

// 2. GANTI PASSWORD (Security)
export const changePassword = async (
  req: CustomRequest,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    // Cek kecocokan password lama
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Password saat ini salah!" });

    // Hash password baru & Simpan
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Kata sandi berhasil diperbarui!" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Gagal mengubah kata sandi" });
  }
};

// 3. LUPA PASSWORD (Forgot Password)
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { email } = req.body;

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      // Demi keamanan, jangan beritahu jika email tidak ada, cukup berikan pesan sukses palsu
      return res.status(200).json({
        message: "Jika email terdaftar, tautan pemulihan telah dikirim.",
      });
    }

    // Buat token dummy sederhana untuk reset (Di production, gunakan JWT khusus reset password)
    const resetToken = Buffer.from(email).toString("base64");
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    // Kirim Email via Nodemailer
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #FF8FC7; border-radius: 10px; padding: 20px; text-align: center;">
        <h2 style="color: #FF8FC7; font-style: italic;">NEON STAGE</h2>
        <h3>Pemulihan Kata Sandi</h3>
        <p>Kami menerima permintaan untuk mereset kata sandi akun Anda.</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #FF8FC7; color: #1C1C1E; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Reset Kata Sandi Sekarang</a>
        <p style="font-size: 12px; color: #888;">Jika Anda tidak meminta reset ini, abaikan saja email ini.</p>
      </div>
    `;
    await sendEmail(email, "🔑 Reset Kata Sandi Anda - Neon Stage", emailHtml);

    return res
      .status(200)
      .json({ message: "Tautan pemulihan telah dikirim ke email Anda." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res
      .status(500)
      .json({ message: "Gagal memproses permintaan reset password" });
  }
};

// 4. PROSES RESET PASSWORD
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token atau password baru tidak valid." });
    }

    // Decode token sederhana (Base64 ke Email)
    const email = Buffer.from(token, "base64").toString("utf-8");

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Tautan reset tidak valid atau sudah kadaluwarsa." });
    }

    // Hash password baru dan simpan ke database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return res
      .status(200)
      .json({ message: "Kata sandi berhasil direset! Silakan login." });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Gagal mereset kata sandi." });
  }
};
