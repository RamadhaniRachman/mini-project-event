import "dotenv/config";
import express from "express";
import authRouter from "./routers/authRouter.js";
import eventRouter from "./routers/eventRouter.js";

const app = express();
const PORT = 8000;
app.use(express.json()); // middleware biar bisa menerima format JSON

//Routenya
app.use("/api/auth", authRouter);
app.use("/api/events", eventRouter);
app.use("/uploads", express.static("uploads"));
// Jalankan server
app.listen(PORT, () => {
  console.log(`🚀 Server berhasil menyala di http://localhost:${PORT}`);
  // Cek apakah pemantau sudah berfungsi:
  console.log(
    "Database URL:",
    process.env.DATABASE_URL ? "Terbaca! ✅" : "Belum terbaca ❌",
  );
});

export default app;
