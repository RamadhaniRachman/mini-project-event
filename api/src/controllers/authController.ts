import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Fungsi bantuan untuk membuat referral code acak
const generateReferralCode = (name: string) => {
  const prefix = name.substring(0, 4).toUpperCase();
  const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix} - ${randomString}`;
};

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log("Request masuk ke /register!");
    console.log("Data dari Postman:", req.body);
    const { name, email, password, role, appliedReferralCode } = req.body;

    // 1. Validasi email belum digunakan
    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    // 2. Hash password menggunakan bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Generate referral code untuk user baru
    const newReferralCode = generateReferralCode(name);

    // 4. Validasi kode referral (jika user memasukkan kode saat daftar)
    let referrerId: number | null = null;
    if (appliedReferralCode) {
      const referrer = await prisma.users.findUnique({
        where: { referral_code: appliedReferralCode },
      });

      if (!referrer) {
        return res
          .status(400)
          .json({ message: "Kode referral tidak ditemukan atau tidak valid" });
      }
      // Simpan ID pemilik kode (diperbaiki: sebelumnya referrerId = referrerId)
      referrerId = referrer.id;
    }

    // 5. Eksekusi prisma transaction (nanti langsung bikin 3 table)
    const result = await prisma.$transaction(async (tx) => {
      // a. Buat user baru
      const newUser = await tx.users.create({
        data: {
          name,
          email,
          password: passwordHash,
          role,
          referral_code: newReferralCode,
          referred_by_id: referrerId, // Langsung pakai nama kolom
        },
      });

      // b. Distribusi reward (Hanya berlaku jika ada referrerID)
      if (referrerId) {
        // Hitung tanggal kadaluwarsa (3 bulan dari pembuatan)
        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + 3);

        // Berikan 10.000 poin ke pemilik kode referral
        await tx.points.create({
          data: {
            amount_earned: 10000,
            remaining_balance: 10000,
            expired_at: expirationDate,
            user_id: referrerId, // Langsung pakai nama kolom
            earned_from_user_id: newUser.id, // Langsung pakai nama kolom
          },
        });

        // Berikan kupon diskon 10% ke user baru
        await tx.coupons.create({
          data: {
            user_id: newUser.id, // Langsung pakai nama kolom
            discount_percentage: 10,
            expired_at: expirationDate, // default is_used false
          },
        });
      }

      // Wajib di-return
      return newUser;
    });

    // 6. Return response sukses
    return res.status(201).json({
      message: "Registrasi berhasil!",
      data: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
        referral_code: result.referral_code,
      },
    });
  } catch (error) {
    console.error("Error saat register:", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // 1. Cari user berdasarkan email di database
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "Email tidak terdaftar!" });
    }

    // 2. Cocokkan password yang diinput dengan password di database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password salah!" });
    }

    // 3. Buat tiket JWT (Satpam)
    // Pastikan Anda sudah punya JWT_SECRET di file .env
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }, // Token berlaku 1 hari
    );

    // 4. Kirim respons sukses beserta token dan data user
    return res.status(200).json({
      message: "Login berhasil!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan saat login" });
  }
};
