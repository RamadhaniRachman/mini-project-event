import React, { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatusMessage("Email dan kata sandi wajib diisi");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setStatusMessage(
          data.message || "Login gagal, periksa kredensial Anda.",
        );
        return;
      }

      setStatusMessage("Login berhasil! Mengalihkan...");
      // Aksi setelah login sukses bisa ditambahkan di sini
      // CEK DATA DARI API DI CONSOLE BROWSER ANDA
      console.log("Data user dari API:", data.user);

      // PALING KRUSIAL
      // Simpan tiket (Token) dan identitas User ke Local Storage browser
      localStorage.setItem("token", data.token);
      // Karena localStorage hanya menerima string, data object user harus di-stringify
      localStorage.setItem("user", JSON.stringify(data.user));
      // -----------------------------

      // Beri jeda sedikit agar pesan sukses terbaca, lalu arahkan sesuai Role
      setTimeout(() => {
        // Ambil role, ubah jadi string, lalu paksa jadi huruf kecil
        const userRole = String(data.user.role || "").toLowerCase();

        if (userRole === "organizer") {
          window.location.href = "/dashboard"; // Organizer masuk ke ruang kontrol
        } else {
          window.location.href = "/"; // Customer masuk ke beranda / profil
        }
      }, 1500);
    } catch (error) {
      console.error(error);
      setStatusMessage("Terjadi kesalahan jaringan");
    }
  };

  return (
    <div className="dark bg-charcoal font-body text-white min-h-screen selection:bg-soft-pink selection:text-charcoal">
      <main className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Artistic Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-soft-pink/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-100 h-[100 bg-light-pink/10 rounded-full blur-[100px]"></div>
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
              {/* Login Details */}
              <div className="space-y-5">
                <div>
                  <label
                    className="block text-[10px] font-label font-bold uppercase tracking-[0.15em] text-white/70 mb-1.5"
                    htmlFor="email"
                  >
                    Alamat Email
                  </label>
                  <input
                    className="w-full bg-charcoal border-none rounded-lg py-3 px-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-soft-pink/40 transition-all outline-none"
                    id="email"
                    name="email"
                    placeholder="example@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      className="block text-[10px] font-label font-bold uppercase tracking-[0.15em] text-white/70"
                      htmlFor="password"
                    >
                      Kata Sandi
                    </label>
                    <a
                      href="#"
                      className="text-[10px] font-label font-semibold text-light-pink hover:text-soft-pink transition-colors"
                    >
                      Lupa Kata Sandi?
                    </a>
                  </div>
                  <input
                    className="w-full bg-charcoal border-none rounded-lg py-3 px-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-soft-pink/40 transition-all outline-none"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {statusMessage && (
                <p className="text-center text-sm font-medium text-soft-pink mt-2">
                  {statusMessage}
                </p>
              )}

              {/* CTA */}
              <div className="pt-6 space-y-4">
                <button
                  className="w-full stage-gradient text-charcoal font-headline font-bold py-4 rounded-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  type="submit"
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
