import nodemailer from "nodemailer";
import "dotenv/config";

// Konfigurasi Transporter (Kurir pengirim email)
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_SENDER,
    pass: process.env.MAIL_PASSWORD,
  },
});

// Fungsi bantuan untuk mengirim email
export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
) => {
  try {
    const info = await transporter.sendMail({
      from: `"Neon Stage" <${process.env.MAIL_SENDER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`✅ Email berhasil dikirim ke ${to} [ID: ${info.messageId}]`);
  } catch (error) {
    console.error(`❌ Gagal mengirim email ke ${to}:`, error);
  }
};
