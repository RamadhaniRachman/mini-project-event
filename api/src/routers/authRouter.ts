import express from "express";
import { register, login } from "../controllers/authController.js";
import { verifyToken, CustomRequest } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { loginSchema, registerSchema } from "../schemas/authSchema.js";

const router = express.Router();

// --- PUBLIC ROUTES (Tidak butuh token) ---
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// --- PROTECTED ROUTES (Butuh token JWT valid) ---
// Rute ini menggunakan verifyToken sebagai middleware penengah
// Di bawah ini untuk menentukan role
router.get(
  "/profile",
  verifyToken,
  (req: CustomRequest, res: express.Response) => {
    // Jika sampai sini, token valid. req.user sudah diisi oleh verifyToken.
    res.status(200).json({
      message: "Akses diizinkan. Ini adalah data rahasia user.",
      user: req.user,
    });
  },
);

export default router;
