import React, { useState } from "react";

export default function Register() {
  const [role, setRole] = useState<"customer" | "organizer">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setStatusMessage("Semua kolom wajib diisi");
      return;
    }
    if (password !== confirmPassword) {
      setStatusMessage("Password dan konfirmasi tidak cocok");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          appliedReferralCode: referralCode || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setStatusMessage(data.message || "Registrasi gagal");
        return;
      }

      setStatusMessage("Registrasi berhasil! Silakan login.");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setReferralCode("");
      setRole("customer");
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
              BERGABUNG DENGAN EKOSISTEM KONSER ELIT
            </p>
          </div>

          {/* Registration Form Container */}
          <div className="bg-dark-gray p-8 md:p-10 rounded-xl shadow-2xl border border-white/5 backdrop-blur-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-label font-bold uppercase tracking-widest text-light-pink">
                  Pilih Peran Anda
                </label>
                <div className="grid grid-cols-2 gap-4">
<<<<<<< HEAD
                  <label className="relative flex items-center justify-center p-4 rounded-lg bg-charcoal cursor-pointer border border-transparent hover:border-soft-pink/30 transition-all group has-[:checked]:bg-soft-pink/10 has-[:checked]:border-soft-pink">
=======
<<<<<<< HEAD
                  <label className="relative flex items-center justify-center p-4 rounded-lg bg-charcoal cursor-pointer border border-transparent hover:border-soft-pink/30 transition-all group has-checked:bg-soft-pink/10 has-checked:border-soft-pink">
=======
                  <label className="relative flex items-center justify-center p-4 rounded-lg bg-charcoal cursor-pointer border border-transparent hover:border-soft-pink/30 transition-all group has-[:checked]:bg-soft-pink/10 has-[:checked]:border-soft-pink">
>>>>>>> fa64156671a963d11307c33f8bf1d9231565110f
>>>>>>> 581cf76636302ef1c09c79c87390951ae3f61ca0
                    <input
                      checked={role === "customer"}
                      className="sr-only peer"
                      name="role"
                      type="radio"
                      value="customer"
                      onChange={() => setRole("customer")}
                    />
                    <div className="flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined text-white/60 group-hover:text-soft-pink transition-colors peer-checked:text-soft-pink">
                        person
                      </span>
                      <span className="text-sm font-semibold tracking-tight text-white/90">
                        Customer
                      </span>
                    </div>
                  </label>
<<<<<<< HEAD
                  <label className="relative flex items-center justify-center p-4 rounded-lg bg-charcoal cursor-pointer border border-transparent hover:border-soft-pink/30 transition-all group has-[:checked]:bg-soft-pink/10 has-[:checked]:border-soft-pink">
=======
<<<<<<< HEAD
                  <label className="relative flex items-center justify-center p-4 rounded-lg bg-charcoal cursor-pointer border border-transparent hover:border-soft-pink/30 transition-all group has-checked:bg-soft-pink/10 has-checked:border-soft-pink">
=======
                  <label className="relative flex items-center justify-center p-4 rounded-lg bg-charcoal cursor-pointer border border-transparent hover:border-soft-pink/30 transition-all group has-[:checked]:bg-soft-pink/10 has-[:checked]:border-soft-pink">
>>>>>>> fa64156671a963d11307c33f8bf1d9231565110f
>>>>>>> 581cf76636302ef1c09c79c87390951ae3f61ca0
                    <input
                      checked={role === "organizer"}
                      className="sr-only peer"
                      name="role"
                      type="radio"
                      value="organizer"
                      onChange={() => setRole("organizer")}
                    />
                    <div className="flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined text-white/60 group-hover:text-soft-pink transition-colors peer-checked:text-soft-pink">
                        confirmation_number
                      </span>
                      <span className="text-sm font-semibold tracking-tight text-white/90">
                        Organizer
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-[10px] font-label font-bold uppercase tracking-[0.15em] text-white/70 mb-1.5"
                    htmlFor="full_name"
                  >
                    Nama Lengkap
                  </label>
                  <input
                    className="w-full bg-charcoal border-none rounded-lg py-3 px-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-soft-pink/40 transition-all outline-none"
                    id="full_name"
                    name="full_name"
                    placeholder="Masukan nama lengkap Anda"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
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
              </div>

              {/* Security */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-[10px] font-label font-bold uppercase tracking-[0.15em] text-white/70 mb-1.5"
                    htmlFor="password"
                  >
                    Kata Sandi
                  </label>
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
                <div>
                  <label
                    className="block text-[10px] font-label font-bold uppercase tracking-[0.15em] text-white/70 mb-1.5"
                    htmlFor="confirm_password"
                  >
                    Konfirmasi
                  </label>
                  <input
                    className="w-full bg-charcoal border-none rounded-lg py-3 px-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-soft-pink/40 transition-all outline-none"
                    id="confirm_password"
                    name="confirm_password"
                    placeholder="••••••••"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Special Highlight: Referral Code */}
              <div className="pt-2">
                <div className="relative group">
                  <label
                    className="block text-[10px] font-label font-bold uppercase tracking-[0.15em] text-light-pink mb-1.5"
                    htmlFor="referral_code"
                  >
                    Kode Referral (Opsional)
                  </label>
                  <div className="relative">
                    <input
                      className="w-full bg-charcoal border-2 border-light-pink/20 rounded-lg py-4 px-12 text-soft-pink font-bold placeholder:text-soft-pink/30 focus:border-light-pink referral-glow transition-all outline-none"
                      id="referral_code"
                      name="referral_code"
                      placeholder="Gunakan kode untuk diskon tiket"
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-light-pink">
                      redeem
                    </span>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-light-pink text-charcoal text-[9px] font-bold px-2 py-0.5 rounded flex items-center">
                      DISKON TERSEDIA
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-white/50 italic text-center">
                  Masukkan kode referral untuk mendapatkan potongan harga
                  eksklusif pada konser pertama Anda.
                </p>
              </div>

              {statusMessage && (
                <p className="text-center text-sm font-medium text-soft-pink mt-2">
                  {statusMessage}
                </p>
              )}

              {/* CTA */}
              <div className="pt-4 space-y-4">
                <button
                  className="w-full stage-gradient text-charcoal font-headline font-bold py-4 rounded-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  type="submit"
                >
                  <span>DAFTAR SEKARANG</span>
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </button>
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="h-px w-8 bg-white/20"></div>
                  <span className="text-xs text-white/60 font-medium">
                    Sudah punya akun?
                  </span>
                  <div className="h-px w-8 bg-white/20"></div>
                </div>
                <a
                  className="w-full text-center block text-soft-pink text-sm font-semibold hover:text-light-pink transition-colors tracking-tight"
                  href="/login"
                >
                  LOGIN DISINI
                </a>
              </div>
            </form>
          </div>

          {/* Policy Footer */}
          <div className="mt-8 text-center text-[10px] text-white/40 font-label uppercase tracking-widest leading-loose">
            Dengan mendaftar, Anda menyetujui{" "}
            <a
              className="text-light-pink hover:underline decoration-light-pink/30"
              href="#"
            >
              Syarat & Ketentuan
            </a>{" "}
            <br />
            serta{" "}
            <a
              className="text-light-pink hover:underline decoration-light-pink/30"
              href="#"
            >
              Kebijakan Privasi
            </a>{" "}
            NOIR STAGE.
          </div>
        </div>
      </main>

      {/* Footer Component Anchor */}
      <footer className="w-full py-12 mt-12 bg-charcoal border-t border-dark-gray">
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
