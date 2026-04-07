import express from "express";
import {
  getDashboardStats,
  createEvent,
  getOrganizerEvents,
} from "../controllers/eventController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
const router = express.Router();

// Semua rute memerlukan login (authorization bearer token)
router.post("/create", verifyToken, upload.single("image"), createEvent);

// menyisipkan upload.single ("image") sebelum createEvent
// "image" adalah nama key yg akan dikirim dari frontend/postnam
router.get("/stats", verifyToken, getDashboardStats);
router.get("/list", verifyToken, getOrganizerEvents);

export default router;
