import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Pastikan react-router-dom sudah diinstall

export default function Login() {
  const API_URL = import.meta.env.VITE_PROJECT_API;

  const navigate = useNavigate(); // Kita gunakan navigate alih-alih window.location.href
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State untuk mengelola pesan error
  const [zodErrors, setZodErrors] = useState<Record<string, string[]>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(""); // State khusus untuk pesan sukses

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    // Bersihkan semua pesan error/sukses di awal
    setZodErrors({});
    setErrorMsg("");
    setSuccessMsg("");

    // Validasi Frontend
    if (!email || !password) {
      setErrorMsg("Email dan kata sandi wajib diisi");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // JIKA LOGIN BERHASIL
      if (response.ok) {
        setSuccessMsg("Login berhasil! Mengalihkan...");

        console.log("Data user dari API:", data.user);

        // Simpan token dan data user ke Local Storage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect berdasarkan role menggunakan setTimeout agar pesan sukses terlihat
        setTimeout(() => {
          const userRole = String(data.user.role || "").toLowerCase();

          if (userRole === "organizer") {
            navigate("/dashboard"); // Organizer ke dashboard
          } else {
            navigate("/"); // Customer ke home
          }
        }, 1500);

        return; // Berhenti di sini
      }

      // JIKA LOGIN GAGAL (Zod Error atau Kredensial Salah)
      if (data.errors) {
        // Jika error dari Zod (Format tidak valid)
        setZodErrors(data.errors);
        setErrorMsg("Mohon perbaiki data yang berwarna merah!");
      } else {
        // Jika error dari Controller (Misal: Password salah atau Email tidak ditemukan)
        setErrorMsg(data.message || "Login gagal, periksa kredensial Anda.");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Terjadi kesalahan jaringan atau server tidak merespon.");
    }
  };

  return (
    <div className="dark bg-charcoal font-body text-white min-h-screen selection:bg-soft-pink selection:text-charcoal">
      <main className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Artistic Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-soft-pink/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-100 h-100 bg-light-pink/10 rounded-full blur-[100px]"></div>
          <div
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center opacity-10 mix-blend-overlay"
            data-alt="vibrant concert arena crowd with pink and purple stage lights and heavy atmospheric smoke"
          ></div>
          <div className="absolute inset-0 noir-overlay"></div>
        </div>

        <div className="relative z-10 w-full max-w-xl">
          {/* Brand Anchor */}
          <div className="text-center mb-10">
            <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-soft-pink mb-2">
              NOIR STAGE
            </h1>
            <p className="text-white/70 font-medium tracking-wide text-sm">
              SELAMAT DATANG KEMBALI
            </p>
          </div>

          {/* Login Form Container */}
          <div className="bg-dark-gray p-8 md:p-10 rounded-xl shadow-2xl border border-white/5 backdrop-blur-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* --- Input Email --- */}
              <div className="space-y-5">
                <div>
                  <label
                    className="block text-[10px] font-label font-bold uppercase tracking-[0.15em] text-white/70 mb-1.5"
                    htmlFor="email"
                  >
                    Alamat Email
                  </label>
                  <input
                    className={`w-full bg-charcoal border rounded-lg p-3 text-white focus:outline-none transition-all ${zodErrors.email ? "border-red-500" : "border-white/10 focus:border-soft-pink"}`}
                    id="email"
                    name="email"
                    placeholder="example@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {/* Munculkan pesan Zod untuk Email */}
                  {zodErrors.email && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">
                      *{zodErrors.email[0]}
                    </p>
                  )}
                </div>

                {/* --- Input Password --- */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      className="block text-[10px] font-label font-bold uppercase tracking-[0.15em] text-white/70"
                      htmlFor="password"
                    >
                      Kata Sandi
                    </label>
                    <a
                      href="/forgot-password"
                      className="text-[10px] font-label font-semibold text-light-pink hover:text-soft-pink transition-colors"
                    >
                      Lupa Kata Sandi?
                    </a>
                  </div>
                  <input
                    className={`w-full bg-charcoal border rounded-lg p-3 text-white focus:outline-none transition-all ${zodErrors.password ? "border-red-500" : "border-white/10 focus:border-soft-pink"}`}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {/* Munculkan pesan Zod untuk Password */}
                  {zodErrors.password && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">
                      *{zodErrors.password[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Tampilkan Pesan Sukses (Warna Pink) */}
              {successMsg && (
                <p className="text-center text-sm font-bold text-soft-pink mt-4 animate-pulse">
                  {successMsg}
                </p>
              )}

              {/* Tampilkan Pesan Error Umum (Warna Merah) */}
              {errorMsg && (
                <p className="text-center text-sm font-bold text-red-500 mt-4 animate-pulse">
                  {errorMsg}
                </p>
              )}

              {/* CTA */}
              <div className="pt-6 space-y-4">
                <button
                  className="w-full stage-gradient text-charcoal font-headline font-bold py-4 rounded-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  type="submit"
                  disabled={!!successMsg} // Tombol mati saat proses login sukses & menunggu redirect
                >
                  <span>MASUK SEKARANG</span>
                  <span className="material-symbols-outlined text-lg">
                    login
                  </span>
                </button>
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="h-px w-8 bg-white/20"></div>
                  <span className="text-xs text-white/60 font-medium">
                    Belum punya akun?
                  </span>
                  <div className="h-px w-8 bg-white/20"></div>
                </div>
                <a
                  className="w-full text-center block text-soft-pink text-sm font-semibold hover:text-light-pink transition-colors tracking-tight"
                  href="/register"
                >
                  Daftar di Stage
                </a>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer Component Anchor */}
      <footer className="w-full py-12 bg-charcoal border-t border-dark-gray relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 gap-6 w-full">
          <div className="font-headline font-extrabold text-soft-pink text-xl tracking-tighter opacity-50">
            NOIR STAGE
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a
              className="font-label uppercase tracking-[0.05em] text-[10px] text-white/40 hover:text-light-pink transition-opacity"
              href="#"
            >
              Terms
            </a>
            <a
              className="font-label uppercase tracking-[0.05em] text-[10px] text-white/40 hover:text-light-pink transition-opacity"
              href="#"
            >
              Privacy
            </a>
            <a
              className="font-label uppercase tracking-[0.05em] text-[10px] text-white/40 hover:text-light-pink transition-opacity"
              href="#"
            >
              Support
            </a>
            <a
              className="font-label uppercase tracking-[0.05em] text-[10px] text-white/40 hover:text-light-pink transition-opacity"
              href="#"
            >
              Artist Portal
            </a>
          </div>
          <p className="font-label uppercase tracking-[0.05em] text-[10px] text-white/40">
            © 2026 NOIR STAGE. THE STAGE IS YOURS.
          </p>
        </div>
      </footer>
    </div>
  );
}
