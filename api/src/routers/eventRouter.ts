import express from "express";
import {
  getDashboardStats,
  createEvent,
  getOrganizerEvents,
  getEventById,
  updateEvent,
  getPublicEvents,
  createPromotion,
  getOrganizerPromotions,
  getAttendees,
  getOrganizerReports,
} from "../controllers/eventController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
const router = express.Router();

// 👇 1. RUTE PUBLIK (Tanpa verifyToken)
router.get("/public", getPublicEvents); // ✅ Aman dan spesifik

// Semua rute memerlukan login (authorization bearer token)
// 2. Rute-rute yang memerlukan login (authorization bearer token)
router.post("/", verifyToken, upload.single("image"), createEvent);

// menyisipkan upload.single ("image") sebelum createEvent
// "image" adalah nama key yg akan dikirim dari frontend/postnam
router.get("/stats", verifyToken, getDashboardStats);
router.get("/list", verifyToken, getOrganizerEvents);
router.get("/promotions/list", verifyToken, getOrganizerPromotions);
router.get("/attendees", verifyToken, getAttendees);
router.get("/reports", verifyToken, getOrganizerReports);
// 3. Rute Dinamis (Harus selalu di paling bawah dari GET lainnya)
router.post("/:id/promotions", verifyToken, createPromotion);
router.get("/:id", getEventById);
router.put("/:id", verifyToken, upload.single("image"), updateEvent);
export default router;
