import React, { useState } from "react";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setIsSuccess(false);
      setStatusMessage("Masukkan email atau nomor telepon Anda.");
      return;
    }

    setStatusMessage("Mengirim tautan...");
    try {
      const res = await fetch(
        "http://localhost:8000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: identifier }),
        },
      );
      const result = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setStatusMessage(result.message);
        setIdentifier("");
      } else {
        setIsSuccess(false);
        setStatusMessage(result.message);
      }
    } catch (error) {
      setIsSuccess(false);
      setStatusMessage("Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div className="dark bg-charcoal font-body text-white min-h-screen flex flex-col justify-center items-center px-6 overflow-hidden relative selection:bg-soft-pink selection:text-charcoal">
      {/* Background Decorative Image (Subtle) */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <img
          alt="Dark aesthetic background"
          className="w-full h-full object-cover grayscale opacity-20"
          src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2000"
        />
        <div className="absolute inset-0 bg-charcoal/80"></div>
      </div>

      {/* Ambient Background Accent */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-soft-pink/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-light-pink/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <main className="w-full max-w-md z-10 relative">
        {/* Logo / Branding Anchor */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black italic text-soft-pink tracking-tighter font-headline uppercase">
            NEON STAGE
          </h2>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-dark-gray p-8 rounded-xl relative overflow-hidden shadow-2xl border border-white/5">
          {/* Decorative Glow Element */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-soft-pink/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Header Section */}
          <header className="mb-8 relative z-10">
            <h1 className="text-4xl font-headline font-extrabold text-white tracking-tight leading-tight mb-3">
              Lupa Kata Sandi
            </h1>
            <p className="text-white/60 text-sm leading-relaxed max-w-[280px]">
              Masukkan email atau nomor telepon Anda untuk menerima tautan
              pemulihan.
            </p>
          </header>

          {/* Form */}
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold uppercase tracking-widest text-light-pink ml-1"
                htmlFor="identifier"
              >
                Email atau Telepon
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-soft-pink transition-colors">
                  <span className="material-symbols-outlined text-xl">
                    alternate_email
                  </span>
                </div>
                <input
                  className="w-full bg-charcoal border border-white/10 rounded-lg py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:ring-1 focus:ring-soft-pink/40 transition-all outline-none"
                  id="identifier"
                  name="identifier"
                  placeholder="nama@email.com"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            {/* Status Message Display */}
            {statusMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-medium border ${isSuccess ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}
              >
                {statusMessage}
              </div>
            )}

            <div className="pt-2">
              <button
                className="w-full stage-gradient text-charcoal font-headline font-bold py-4 rounded-lg shadow-[0_0_20px_rgba(255,143,199,0.2)] hover:shadow-[0_0_30px_rgba(255,143,199,0.4)] active:scale-[0.98] hover:brightness-110 transition-all duration-300 uppercase tracking-widest text-sm"
                type="submit"
              >
                Kirim Tautan Reset
              </button>
            </div>
          </form>
        </div>

        {/* Footer Link */}
        <footer className="mt-8 text-center">
          <a
            className="inline-flex items-center gap-2 text-white/60 hover:text-soft-pink transition-colors text-sm font-medium group"
            href="/login"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            Kembali ke Login
          </a>
        </footer>
      </main>

      {/* Support/Legal (Minimalist) */}
      <div className="fixed bottom-8 text-[10px] uppercase tracking-[0.2em] text-white/30 flex gap-6 z-10">
        <a className="hover:text-soft-pink transition-colors" href="#">
          Bantuan
        </a>
        <a className="hover:text-soft-pink transition-colors" href="#">
          Privasi
        </a>
        <a className="hover:text-soft-pink transition-colors" href="#">
          Syarat & Ketentuan
        </a>
      </div>
    </div>
  );
}
