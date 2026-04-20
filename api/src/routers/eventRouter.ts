import express from "express";
import {
  getDashboardStats,
  createEvent,
  getOrganizerEvents,
  getEventById,
  updateEvent,
} from "../controllers/eventController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
const router = express.Router();

// Semua rute memerlukan login (authorization bearer token)
router.post("/", verifyToken, upload.single("image"), createEvent);

// menyisipkan upload.single ("image") sebelum createEvent
// "image" adalah nama key yg akan dikirim dari frontend/postnam
router.get("/stats", verifyToken, getDashboardStats);
router.get("/list", verifyToken, getOrganizerEvents);
router.get("/:id", getEventById);
router.put("/:id", verifyToken, upload.single("image"), updateEvent);
export default router;
