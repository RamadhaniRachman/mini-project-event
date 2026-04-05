import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  //1. Menentukan lokasi folder penyimpanan
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  // 2. Menentukan nama file (menggunakan timestamp boar unik)
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Hasilnya misal 17123456789-123456789.jpg
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });
