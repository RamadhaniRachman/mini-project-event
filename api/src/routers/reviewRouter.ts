import express from "express";
import {
  createReview,
  getOrganizerReviews,
} from "../controllers/reviewController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rute untuk Customer mengirim ulasan
router.post("/", verifyToken, createReview);

// Rute Publik untuk melihat ulasan milik Organizer tertentu
// Tidak perlu verifyToken agar siapa saja bisa melihat rating organizer
router.get("/organizer/:organizerId", getOrganizerReviews);

export default router;
