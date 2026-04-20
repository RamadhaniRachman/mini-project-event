import { z } from "zod";

// 1. Untuk register
export const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal harus 3 huruf"),
  email: z.string().email("Format email tidak valid (contoh: budi@mail.com)"),
  password: z
    .string()
    .min(6, "Password minimal harus 6 karakter")
    .regex(/[A-Z]/, "Minimal berisikan 1 huruf kapital")
    .regex(/[a-z]/, "Minimal berisikan 1 huruf kapitil")
    .regex(/[0-9]/, "Minimal berisikan 1 angka"),
  role: z.enum(["customer", "organizer"], {
    required_error: "Role wajib diisi",
    invalid_type_error: "Role harus customer atau organizer",
  }),
});

// 2. Untuk login
export const loginSchema = z.object({
  email: z.string().email("Email tidak sesuai"),
  password: z.string().min(1, " Password wajib diisi"),
});
