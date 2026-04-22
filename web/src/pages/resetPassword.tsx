import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token"); // Mengambil token dari URL email

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Jika tidak ada token di URL, tendang kembali ke login
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatusMsg("Konfirmasi password tidak cocok!");
      return;
    }

    setStatusMsg("Memproses...");
    try {
      const res = await fetch("http://localhost:8000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const result = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setStatusMsg(result.message);
        setTimeout(() => navigate("/login"), 3000); // Otomatis ke login setelah 3 detik
      } else {
        setStatusMsg(result.message);
      }
    } catch (error) {
      setStatusMsg("Terjadi kesalahan jaringan.");
    }
  };

  if (!token) return null;

  return (
    <div className="dark bg-charcoal font-body text-white min-h-screen flex flex-col justify-center items-center px-6 selection:bg-soft-pink selection:text-charcoal">
      <div className="w-full max-w-md bg-dark-gray p-8 rounded-xl border border-white/5 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black italic text-soft-pink tracking-tighter font-headline uppercase mb-2">
            NEON STAGE
          </h2>
          <h1 className="text-2xl font-bold text-white">Buat Password Baru</h1>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 ml-1">
              Password Baru
            </label>
            <input
              className="w-full bg-charcoal border border-white/10 rounded-lg py-4 px-4 text-white focus:ring-1 focus:ring-soft-pink/40 outline-none"
              type="password"
              placeholder="Minimal 6 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 ml-1">
              Konfirmasi Password
            </label>
            <input
              className="w-full bg-charcoal border border-white/10 rounded-lg py-4 px-4 text-white focus:ring-1 focus:ring-soft-pink/40 outline-none"
              type="password"
              placeholder="Ulangi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {statusMsg && (
            <div
              className={`p-3 text-center text-sm font-bold rounded-lg ${isSuccess ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"}`}
            >
              {statusMsg}
            </div>
          )}

          <button
            className="w-full stage-gradient text-charcoal font-bold py-4 rounded-lg hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest text-sm disabled:opacity-50"
            type="submit"
            disabled={!newPassword || !confirmPassword || isSuccess}
          >
            {isSuccess ? "Berhasil!" : "Simpan Password Baru"}
          </button>
        </form>
      </div>
    </div>
  );
}
