import React, { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Simpan tiket (token) dan data user ke brankas browser
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // 2. Cek peran (role) user, lalu arahkan ke halaman yang sesuai
        const userRole = String(data.user.role).toLowerCase();
        if (userRole === "organizer") {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/"; // Arahkan Customer ke halaman utama
        }
      } else {
        setErrorMsg(
          data.message || "Gagal login. Periksa email/password Anda.",
        );
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Terjadi kesalahan jaringan. Coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal text-white flex items-center justify-center p-4 selection:bg-soft-pink selection:text-charcoal">
      <div className="w-full max-w-md bg-dark-gray border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Dekorasi Cahaya Blur */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-soft-pink/20 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-12 h-12 bg-soft-pink/10 text-soft-pink rounded-xl flex items-center justify-center mx-auto mb-4 border border-soft-pink/20">
            <span className="material-symbols-outlined text-2xl font-bold">
              theater_comedy
            </span>
          </div>
          <h1 className="text-2xl font-headline font-black tracking-tight mb-1">
            Welcome Back
          </h1>
          <p className="text-xs text-white/60">
            Masuk ke akun EventHubPro Anda
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div className="space-y-1">
            <label className="text-[10px] font-label uppercase tracking-widest text-white/60">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-soft-pink focus:outline-none transition-colors"
              placeholder="nama@email.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-label uppercase tracking-widest text-white/60">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-soft-pink focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-soft-pink text-charcoal font-bold text-sm rounded-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4"
          >
            {isLoading ? "Memeriksa..." : "Log In"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-white/60 relative z-10">
          Belum punya akun?{" "}
          <a
            href="/register"
            className="text-soft-pink font-bold hover:underline"
          >
            Daftar Sekarang
          </a>
        </p>
      </div>
    </div>
  );
}
