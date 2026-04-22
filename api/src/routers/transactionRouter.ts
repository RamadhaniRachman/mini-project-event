import express from "express";
import {
  checkout,
  getOrganizerTransactions,
  validatePromo,
  verifyTransaction,
  getTransactionById,
} from "../controllers/transactionController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rute untuk Customer Beli Tiket
router.post("/checkout", verifyToken, checkout);

// 👇 Rute untuk Organizer Melihat Daftar Transaksi
router.get("/list", verifyToken, getOrganizerTransactions);
router.post("/validate-promo", verifyToken, validatePromo);
router.get("/:id", verifyToken, getTransactionById);
router.put("/:id/verify", verifyToken, verifyTransaction);

export default router;
