import React, { useEffect, useState } from "react";

export default function Security() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States for Password Visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sidebar State
  const [activeMenu, setActiveMenu] = useState("security");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      window.location.href = "/login";
      return;
    }

    setUser(JSON.parse(userString));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Konfirmasi password baru tidak cocok!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:8000/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        },
      );
      const result = await res.json();

      alert(result.message);
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-charcoal flex justify-center items-center text-soft-pink font-headline font-bold text-xl tracking-widest animate-pulse">
        MEMUAT PROFIL...
      </div>
    );
  }

  // Password strength calculation simulation
  const getPasswordStrength = () => {
    if (newPassword.length === 0) return 0;
    if (newPassword.length < 6) return 1; // Lemah
    if (newPassword.length < 10) return 2; // Sedang
    return 4; // Kuat
  };

  const strength = getPasswordStrength();

  return (
    <div className="dark bg-charcoal font-body text-white min-h-screen selection:bg-soft-pink selection:text-charcoal pb-24 md:pb-0">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-charcoal/80 backdrop-blur-[20px] shadow-[0px_10px_30px_rgba(0,0,0,0.3)] border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div className="text-2xl font-black italic text-soft-pink tracking-tighter font-headline uppercase">
            NEON STAGE
          </div>

          <nav className="hidden md:flex gap-8 items-center font-headline tracking-tight">
            {user.role === "organizer" ? (
              <a
                className="text-white/60 hover:text-soft-pink px-3 py-1 transition-all duration-300"
                href="/dashboard"
              >
                Dashboard
              </a>
            ) : (
              <a
                className="text-white/60 hover:text-soft-pink px-3 py-1 transition-all duration-300"
                href="/"
              >
                Home
              </a>
            )}
            <a
              className="text-white/60 hover:text-soft-pink px-3 py-1 transition-all duration-300"
              href="#"
            >
              Events
            </a>
            <a
              className="text-white/60 hover:text-soft-pink px-3 py-1 transition-all duration-300"
              href="#"
            >
              Tickets
            </a>
            <a
              className="text-soft-pink font-bold border-b-2 border-soft-pink px-3 py-1"
              href="/profile"
            >
              Profile
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-white/60 hover:text-soft-pink active:scale-95 transition-all">
              notifications
            </button>
            <button className="material-symbols-outlined text-white/60 hover:text-soft-pink active:scale-95 transition-all hidden sm:block">
              confirmation_number
            </button>

            <div className="group relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-soft-pink/30 bg-dark-gray flex items-center justify-center cursor-pointer hover:border-soft-pink transition-colors">
                <span className="font-bold text-soft-pink text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute right-0 mt-2 w-32 bg-dark-gray border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-charcoal rounded-lg font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-32 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Editorial Header Section */}
        <div className="mb-12 relative">
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-soft-pink/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="relative z-10">
            <span className="text-soft-pink font-label text-sm uppercase tracking-[0.2em] mb-4 block">
              Keamanan Akun
            </span>
            <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter text-white leading-none mb-6 uppercase">
              Keamanan &<br />
              <span className="text-light-pink italic">Kata Sandi</span>
            </h1>
            <p className="text-white/60 max-w-xl text-lg leading-relaxed">
              Kelola akses akun Anda dan pastikan informasi pribadi Anda tetap
              terlindungi dengan standar keamanan panggung utama.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-3 space-y-2">
            <a
              href="/profile"
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeMenu === "general" ? "bg-dark-gray text-soft-pink border border-white/5 shadow-[0_0_15px_rgba(255,143,199,0.1)]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              <span className="material-symbols-outlined">person</span>
              General
            </a>
            <button
              onClick={() => setActiveMenu("security")}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeMenu === "security" ? "bg-dark-gray text-soft-pink border border-white/5 shadow-[0_0_15px_rgba(255,143,199,0.1)]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              <span className="material-symbols-outlined">security</span>
              Security
            </button>
            <button
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all text-white/60 hover:bg-white/5 hover:text-white`}
            >
              <span className="material-symbols-outlined">
                notifications_active
              </span>
              Notifications
            </button>
          </aside>

          {/* Form Card */}
          <div className="md:col-span-5 bg-dark-gray border border-white/5 rounded-xl overflow-hidden shadow-2xl relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-soft-pink/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-soft-pink/10 transition-colors pointer-events-none"></div>
            <div className="p-8 md:p-10 relative">
              <form className="space-y-8" onSubmit={handleSave}>
                {/* Input Field: Password Sekarang */}
                <div className="space-y-3">
                  <label className="block text-sm font-label font-bold uppercase tracking-widest text-white/60 ml-1">
                    Password Sekarang
                  </label>
                  <div className="relative group/input">
                    <input
                      className="w-full bg-charcoal border border-white/10 rounded-lg py-4 px-5 text-white focus:ring-1 focus:ring-soft-pink/40 placeholder:text-white/30 transition-all outline-none"
                      placeholder="••••••••"
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/40 cursor-pointer hover:text-soft-pink transition-colors"
                    >
                      {showCurrent ? "visibility_off" : "visibility"}
                    </span>
                  </div>
                </div>

                <div className="h-2"></div>

                {/* Input Field: Password Baru */}
                <div className="space-y-3">
                  <label className="block text-sm font-label font-bold uppercase tracking-widest text-white/60 ml-1">
                    Password Baru
                  </label>
                  <div className="relative group/input">
                    <input
                      className="w-full bg-charcoal border border-white/10 rounded-lg py-4 px-5 text-white focus:ring-1 focus:ring-soft-pink/40 placeholder:text-white/30 transition-all outline-none"
                      placeholder="Entri password baru"
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowNew(!showNew)}
                      className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/40 cursor-pointer hover:text-soft-pink transition-colors"
                    >
                      {showNew ? "visibility_off" : "visibility"}
                    </span>
                  </div>

                  {/* Password Strength Indicator */}
                  <div className="flex gap-1 mt-2 px-1 items-center">
                    <div
                      className={`h-1 flex-1 rounded-full transition-colors ${strength >= 1 ? "bg-red-400" : "bg-white/10"}`}
                    ></div>
                    <div
                      className={`h-1 flex-1 rounded-full transition-colors ${strength >= 2 ? "bg-yellow-400" : "bg-white/10"}`}
                    ></div>
                    <div
                      className={`h-1 flex-1 rounded-full transition-colors ${strength >= 4 ? "bg-green-400" : "bg-white/10"}`}
                    ></div>
                    <div
                      className={`h-1 flex-1 rounded-full transition-colors ${strength >= 4 ? "bg-green-400" : "bg-white/10"}`}
                    ></div>
                    <span
                      className={`text-[10px] uppercase font-bold ml-2 tracking-wider ${
                        strength === 0
                          ? "text-white/40"
                          : strength === 1
                            ? "text-red-400"
                            : strength === 2
                              ? "text-yellow-400"
                              : "text-green-400"
                      }`}
                    >
                      {strength === 0
                        ? "KOSONG"
                        : strength === 1
                          ? "LEMAH"
                          : strength === 2
                            ? "SEDANG"
                            : "KUAT"}
                    </span>
                  </div>
                </div>

                {/* Input Field: Konfirmasi Password Baru */}
                <div className="space-y-3">
                  <label className="block text-sm font-label font-bold uppercase tracking-widest text-white/60 ml-1">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative group/input">
                    <input
                      className="w-full bg-charcoal border border-white/10 rounded-lg py-4 px-5 text-white focus:ring-1 focus:ring-soft-pink/40 placeholder:text-white/30 transition-all outline-none"
                      placeholder="Ulangi password baru"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/40 cursor-pointer hover:text-soft-pink transition-colors"
                    >
                      {showConfirm ? "lock_open" : "lock"}
                    </span>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[10px] text-red-400 ml-1 mt-1 font-bold">
                      Password tidak cocok
                    </p>
                  )}
                </div>

                {/* Action Button */}
                <button
                  className="w-full mt-10 py-5 rounded-lg stage-gradient text-charcoal font-bold text-lg shadow-[0_10px_30px_rgba(255,143,199,0.2)] hover:shadow-[0_15px_40px_rgba(255,143,199,0.4)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword
                  }
                >
                  Perbarui Kata Sandi
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar / Helper Grid */}
          <div className="md:col-span-4 space-y-8">
            {/* Forgot Password Info Block */}
            <div className="bg-dark-gray border border-white/5 p-8 rounded-xl relative overflow-hidden group hover:bg-charcoal transition-colors">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                <span
                  className="material-symbols-outlined text-[120px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  help
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-headline font-bold text-soft-pink mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">
                    key_visualizer
                  </span>
                  Lupa Password?
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Jangan khawatir, hal ini biasa terjadi di keramaian konser.
                  Klik tombol di bawah untuk memulai proses pemulihan akun
                  melalui email terdaftar Anda.
                </p>
                <a
                  className="inline-flex items-center gap-2 text-soft-pink font-bold text-sm uppercase tracking-widest hover:gap-4 transition-all"
                  href="#"
                >
                  Reset Sekarang
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </a>
              </div>
            </div>

            {/* Security Tips Block */}
            <div className="bg-charcoal p-8 rounded-xl border border-white/5 border-l-4 border-l-soft-pink/60 shadow-lg">
              <h3 className="text-sm font-label font-bold uppercase tracking-widest text-white mb-4">
                Tips Keamanan
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-white/60 italic items-start">
                  <span
                    className="material-symbols-outlined text-soft-pink text-sm mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  Gunakan minimal 12 karakter unik.
                </li>
                <li className="flex gap-3 text-sm text-white/60 italic items-start">
                  <span
                    className="material-symbols-outlined text-soft-pink text-sm mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  Hindari tanggal lahir atau nama hewan peliharaan.
                </li>
                <li className="flex gap-3 text-sm text-white/60 italic items-start">
                  <span
                    className="material-symbols-outlined text-soft-pink text-sm mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  Aktifkan Autentikasi Dua Faktor (2FA) untuk perlindungan
                  ekstra.
                </li>
              </ul>
            </div>

            {/* Visual Decorative Card */}
            <div className="relative h-48 rounded-xl overflow-hidden shadow-2xl border border-white/5">
              <img
                alt="Stage lighting"
                className="w-full h-full object-cover grayscale opacity-60 hover:grayscale-0 hover:opacity-80 transition-all duration-700"
                src="https://images.unsplash.com/photo-1540039155732-684735035727?auto=format&fit=crop&q=80&w=400"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <p className="text-[10px] font-label font-bold uppercase tracking-[0.3em] text-white/50">
                  Protected by
                </p>
                <p className="text-sm font-headline font-black text-soft-pink italic tracking-tight">
                  NOIR SHIELD V.4
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-charcoal/90 backdrop-blur-[20px] shadow-[0px_-10px_30px_rgba(0,0,0,0.5)] z-50 border-t border-white/5 rounded-t-2xl">
        <a
          href={user?.role === "organizer" ? "/dashboard" : "/"}
          className="flex flex-col items-center justify-center text-white/40 hover:text-soft-pink transition-colors active:scale-90 transition-transform duration-200"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-1">
            Home
          </span>
        </a>
        <a
          href="#"
          className="flex flex-col items-center justify-center text-white/40 hover:text-soft-pink transition-colors active:scale-90 transition-transform duration-200"
        >
          <span className="material-symbols-outlined">explore</span>
          <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-1">
            Events
          </span>
        </a>
        <a
          href="#"
          className="flex flex-col items-center justify-center text-white/40 hover:text-soft-pink transition-colors active:scale-90 transition-transform duration-200"
        >
          <span className="material-symbols-outlined">confirmation_number</span>
          <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-1">
            Tickets
          </span>
        </a>
        <a
          href="/profile"
          className="flex flex-col items-center justify-center stage-gradient text-charcoal rounded-xl px-4 py-1.5 shadow-[0_0_15px_rgba(255,143,199,0.3)] active:scale-90 transition-transform duration-200"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-headline text-[10px] font-bold uppercase tracking-widest mt-0.5">
            Profile
          </span>
        </a>
      </nav>
    </div>
  );
}
