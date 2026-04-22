import React, { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // Form States - Profile
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  // Form States - Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Menu Setting State
  const [activeMenu, setActiveMenu] = useState("general");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      window.location.href = "/login";
      return;
    }

    const userData = JSON.parse(userString);
    setUser(userData);

    // Pre-fill form dengan data user
    setFullName(userData.name || "");
    setUsername(userData.name?.toLowerCase().replace(/\s+/g, "_") || "");
    setEmail(userData.email || "");
    setPhone("+62 812 3456 7890"); // Placeholder
    setBio(
      "Penikmat konser dan festival musik sejati. Selalu mencari barisan terdepan di setiap stage!",
    ); // Placeholder
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // --- HANDLER UPDATE PROFIL ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", fullName);
    formData.append("phone", phone);
    formData.append("bio", bio);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/auth/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await res.json();

      if (res.ok) {
        alert("Profil berhasil diperbarui!");
        const updatedUser = { ...user, name: fullName };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser as any);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // --- HANDLER GANTI PASSWORD ---
  const handleSavePassword = async (e: React.FormEvent) => {
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

  const handleCancel = () => {
    window.history.back();
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
    if (newPassword.length < 6) return 1;
    if (newPassword.length < 10) return 2;
    return 4;
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
              className="text-soft-pink font-bold border-b-2 border-soft-pink px-3 py-1"
              href="/profile"
            >
              Profile
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="group relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-soft-pink/30 bg-dark-gray flex items-center justify-center cursor-pointer hover:border-soft-pink transition-colors">
                <span className="font-bold text-soft-pink text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              {/* Dropdown Logout */}
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
          <h1 className="text-6xl md:text-7xl font-black italic text-white/5 absolute -top-8 -left-4 select-none uppercase tracking-tighter font-headline">
            Setting
          </h1>
          <h2 className="text-4xl font-extrabold text-white relative font-headline tracking-tight">
            Pengaturan Akun
          </h2>
          <p className="text-white/60 mt-2 max-w-md relative z-10 text-sm">
            Kelola informasi akun Anda dan atur preferensi panggung digital
            Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-3 space-y-2">
            <button
              onClick={() => setActiveMenu("general")}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeMenu === "general" ? "bg-dark-gray text-soft-pink border border-white/5 shadow-[0_0_15px_rgba(255,143,199,0.1)]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              <span className="material-symbols-outlined">person</span> General
            </button>
            <button
              onClick={() => setActiveMenu("security")}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeMenu === "security" ? "bg-dark-gray text-soft-pink border border-white/5 shadow-[0_0_15px_rgba(255,143,199,0.1)]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              <span className="material-symbols-outlined">security</span>{" "}
              Security
            </button>
          </aside>

          {/* Main Form Canvas */}
          <div className="md:col-span-9 bg-dark-gray border border-white/5 rounded-xl p-6 md:p-10 space-y-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-soft-pink/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>

            {/* ===================== MENU GENERAL (PROFIL) ===================== */}
            {activeMenu === "general" && (
              <div className="animate-in fade-in duration-300">
                <section className="flex flex-col md:flex-row items-center gap-8 mb-12">
                  <div className="relative group">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-charcoal bg-charcoal shadow-[0_0_20px_rgba(255,143,199,0.15)] flex items-center justify-center">
                      <span className="text-5xl font-bold text-soft-pink">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <button className="absolute bottom-2 right-2 bg-soft-pink text-charcoal p-3 rounded-full shadow-lg hover:brightness-110 active:scale-90 transition-all flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">
                        photo_camera
                      </span>
                    </button>
                  </div>
                  <div className="text-center md:text-left space-y-2">
                    <h3 className="text-xl font-bold font-headline text-white">
                      Foto Profil
                    </h3>
                    <p className="text-sm text-white/60 max-w-xs">
                      Unggah foto baru. Rekomendasi ukuran minimal 400x400px.
                    </p>
                    <div className="flex gap-3 pt-2 justify-center md:justify-start">
                      <button className="text-xs uppercase font-bold tracking-widest text-soft-pink bg-soft-pink/10 px-4 py-2 rounded-lg hover:bg-soft-pink/20 transition-all border border-soft-pink/20">
                        Ganti Foto
                      </button>
                    </div>
                  </div>
                </section>

                <form
                  className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8"
                  onSubmit={handleSaveProfile}
                >
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-[0.2em] font-bold text-light-pink ml-1">
                      Nama Lengkap
                    </label>
                    <input
                      className="w-full bg-charcoal border border-white/10 focus:ring-1 focus:ring-soft-pink/40 rounded-lg py-4 px-5 text-white outline-none"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-[0.2em] font-bold text-light-pink ml-1">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40">
                        @
                      </span>
                      <input
                        className="w-full bg-charcoal border border-white/10 focus:ring-1 focus:ring-soft-pink/40 rounded-lg py-4 pl-10 pr-5 text-white outline-none"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-[0.2em] font-bold text-light-pink ml-1">
                      Alamat Email
                    </label>
                    <input
                      className="w-full bg-charcoal border border-white/10 rounded-lg py-4 px-5 text-white outline-none opacity-70 cursor-not-allowed"
                      type="email"
                      value={email}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-[0.2em] font-bold text-light-pink ml-1">
                      Nomor Telepon
                    </label>
                    <input
                      className="w-full bg-charcoal border border-white/10 focus:ring-1 focus:ring-soft-pink/40 rounded-lg py-4 px-5 text-white outline-none"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-xs uppercase tracking-[0.2em] font-bold text-light-pink ml-1">
                      Bio Singkat
                    </label>
                    <textarea
                      className="w-full bg-charcoal border border-white/10 focus:ring-1 focus:ring-soft-pink/40 rounded-lg py-4 px-5 text-white outline-none resize-none"
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={200}
                    ></textarea>
                  </div>
                  <div className="md:col-span-2 flex gap-4 pt-6 border-t border-white/5">
                    <button
                      className="flex-[2] stage-gradient text-charcoal py-4 rounded-lg font-bold text-lg hover:brightness-110 transition-all"
                      type="submit"
                    >
                      Simpan Perubahan
                    </button>
                    <button
                      className="flex-1 border border-white/20 text-white/60 py-4 rounded-lg font-bold hover:bg-white/5 transition-all"
                      type="button"
                      onClick={handleCancel}
                    >
                      Batalkan
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ===================== MENU SECURITY (PASSWORD) ===================== */}
            {activeMenu === "security" && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8">
                  <h3 className="text-xl font-bold font-headline text-white mb-2">
                    Keamanan & Kata Sandi
                  </h3>
                  <p className="text-sm text-white/60">
                    Ganti kata sandi Anda secara berkala untuk menjaga keamanan
                    akun.
                  </p>
                </div>

                <form
                  className="space-y-6 max-w-lg"
                  onSubmit={handleSavePassword}
                >
                  {/* Password Sekarang */}
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-[0.2em] font-bold text-light-pink ml-1">
                      Password Sekarang
                    </label>
                    <div className="relative">
                      <input
                        className="w-full bg-charcoal border border-white/10 rounded-lg py-4 px-5 text-white focus:ring-1 focus:ring-soft-pink/40 outline-none"
                        placeholder="••••••••"
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                      <span
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/40 cursor-pointer hover:text-soft-pink"
                      >
                        {showCurrent ? "visibility_off" : "visibility"}
                      </span>
                    </div>
                  </div>

                  <div className="h-4 border-b border-white/5 mb-4"></div>

                  {/* Password Baru */}
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-[0.2em] font-bold text-light-pink ml-1">
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        className="w-full bg-charcoal border border-white/10 rounded-lg py-4 px-5 text-white focus:ring-1 focus:ring-soft-pink/40 outline-none"
                        placeholder="Entri password baru"
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <span
                        onClick={() => setShowNew(!showNew)}
                        className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/40 cursor-pointer hover:text-soft-pink"
                      >
                        {showNew ? "visibility_off" : "visibility"}
                      </span>
                    </div>
                    {/* Indikator Kekuatan */}
                    <div className="flex gap-1 mt-2 items-center">
                      <div
                        className={`h-1 flex-1 rounded-full ${strength >= 1 ? "bg-red-400" : "bg-white/10"}`}
                      ></div>
                      <div
                        className={`h-1 flex-1 rounded-full ${strength >= 2 ? "bg-yellow-400" : "bg-white/10"}`}
                      ></div>
                      <div
                        className={`h-1 flex-1 rounded-full ${strength >= 4 ? "bg-green-400" : "bg-white/10"}`}
                      ></div>
                      <span className="text-[10px] uppercase font-bold ml-2 text-white/40 w-12 text-center">
                        {strength === 0
                          ? ""
                          : strength === 1
                            ? "LEMAH"
                            : strength === 2
                              ? "SEDANG"
                              : "KUAT"}
                      </span>
                    </div>
                  </div>

                  {/* Konfirmasi Password */}
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-[0.2em] font-bold text-light-pink ml-1">
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <input
                        className="w-full bg-charcoal border border-white/10 rounded-lg py-4 px-5 text-white focus:ring-1 focus:ring-soft-pink/40 outline-none"
                        placeholder="Ulangi password baru"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <span
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/40 cursor-pointer hover:text-soft-pink"
                      >
                        {showConfirm ? "lock_open" : "lock"}
                      </span>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-[10px] text-red-400 mt-1 font-bold">
                        Password tidak cocok
                      </p>
                    )}
                  </div>

                  <button
                    className="w-full mt-8 py-4 rounded-lg stage-gradient text-charcoal font-bold text-lg hover:brightness-110 transition-all disabled:opacity-50"
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
