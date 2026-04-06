import express from "express";
import { register, login } from "../controllers/authController.js";
import { verifyToken, CustomRequest } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- PUBLIC ROUTES (Tidak butuh token) ---
router.post("/register", register);
router.post("/login", login);

// --- PROTECTED ROUTES (Butuh token JWT valid) ---
// Rute ini menggunakan verifyToken sebagai middleware penengah
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
