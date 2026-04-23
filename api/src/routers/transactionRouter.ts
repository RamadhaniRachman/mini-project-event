import express from "express";
import {
  checkout,
  getOrganizerTransactions,
  validatePromo,
  verifyTransaction,
  getTransactionById,
  getUserRewards,
  uploadProof,
  getCustomerTransactions,
} from "../controllers/transactionController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadCloud } from "../middleware/uploadMiddleware.js";
const router = express.Router();

// Rute untuk Customer Beli Tiket
router.post("/checkout", verifyToken, checkout);
router.get("/rewards", verifyToken, getUserRewards);
router.get("/history", verifyToken, getCustomerTransactions);
router.put(
  "/:id/upload-proof",
  verifyToken,
  uploadCloud.single("payment_proof"), // Nama field di Frontend (FormData) harus "payment_proof"
  uploadProof,
);
// 👇 Rute untuk Organizer Melihat Daftar Transaksi
router.get("/list", verifyToken, getOrganizerTransactions);
router.post("/validate-promo", verifyToken, validatePromo);
router.get("/:id", verifyToken, getTransactionById);
router.put("/:id/verify", verifyToken, verifyTransaction);

export default router;
