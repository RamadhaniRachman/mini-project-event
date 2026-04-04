import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routers/authRouter.js";

const app = express();
const PORT = 8000;
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json()); // middleware biar bisa menerima format JSON

//Routenya
app.use("/api/auth", authRouter);

// Jalankan server
app.listen(PORT, () => {
  console.log(`🚀 Server berhasil menyala di http://localhost:${PORT}`);
  // Cek apakah kacamata sudah berfungsi:
  console.log(
    "Database URL:",
    process.env.DATABASE_URL ? "Terbaca! ✅" : "Belum terbaca ❌",
  );
  console.log(
    "JWT Secret   :",
    process.env.JWT_SECRET
      ? "Terbaca! ✅ (Aman)"
      : "Belum terbaca ❌ (Bahaya!)",
  );
});

export default app;
