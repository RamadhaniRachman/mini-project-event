import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routers/authRouter.js";
import eventRouter from "./routers/eventRouter.js";
import transactionRouter from "./routers/transactionRouter.js";

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

//Routenya
app.use("/api/auth", authRouter);
app.use("/api/events", eventRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/users", authRouter);
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
