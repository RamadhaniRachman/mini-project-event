import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

  // MENU SETTING STATE
  const [activeMenu, setActiveMenu] = useState("history");

  // STATE RIWAYAT TRANSAKSI
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // 🔴 STATE UNTUK MODAL ULASAN 🔴
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewEventId, setReviewEventId] = useState<number | null>(null);
  const [reviewEventTitle, setReviewEventTitle] = useState("");
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      window.location.href = "/login";
      return;
    }

    const userData = JSON.parse(userString);
    setUser(userData);

    setFullName(userData.name || "");
    setUsername(userData.name?.toLowerCase().replace(/\s+/g, "_") || "");
    setEmail(userData.email || "");
    setPhone("+62 812 3456 7890");
    setBio(
      "Penikmat konser dan festival musik sejati. Selalu mencari barisan terdepan di setiap stage!",
    );

    // FETCH RIWAYAT TRANSAKSI
    const fetchHistory = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/transactions/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.ok) {
          const result = await response.json();
          setTransactions(result.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

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

  // 🔴 HANDLER BUKA MODAL REVIEW
  const openReviewModal = (eventId: number, eventTitle: string) => {
    setReviewEventId(eventId);
    setReviewEventTitle(eventTitle);
    setRating(5); // Default Bintang 5
    setFeedback("");
    setSuggestions("");
    setIsReviewModalOpen(true);
  };

  // 🔴 HANDLER KIRIM REVIEW
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: reviewEventId,
          rating,
          feedback,
          suggestions,
        }),
      });
      const result = await res.json();

      if (res.ok) {
        alert("Terima kasih! Ulasan Anda berhasil dikirim.");
        setIsReviewModalOpen(false);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Gagal mengirim ulasan jaringan.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
            Menunggu Pembayaran
          </span>
        );
      case "waiting_admin":
        return (
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
            Diproses Admin
          </span>
        );
      case "success":
        return (
          <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
            Selesai (E-Ticket)
          </span>
        );
      case "rejected":
        return (
          <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
            Ditolak
          </span>
        );
      case "expired":
        return (
          <span className="bg-white/5 text-white/40 border border-white/10 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
            Kedaluwarsa
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
            Dibatalkan
          </span>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-charcoal flex justify-center items-center text-soft-pink font-headline font-bold text-xl tracking-widest animate-pulse">
        MEMUAT PROFIL...
      </div>
    );
  }

  const strength =
    newPassword.length === 0
      ? 0
      : newPassword.length < 6
        ? 1
        : newPassword.length < 10
          ? 2
          : 4;

  return (
    <div className="dark bg-charcoal font-body text-white min-h-screen selection:bg-soft-pink selection:text-charcoal pb-24 md:pb-0">
      {/* HEADER NAVBAR */}
      <header className="fixed top-0 w-full z-50 bg-charcoal/80 backdrop-blur-[20px] shadow-lg border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div className="text-2xl font-black italic text-soft-pink tracking-tighter font-headline uppercase">
            NEON STAGE
          </div>
          <nav className="hidden md:flex gap-8 items-center font-headline tracking-tight">
            {user.role === "organizer" ? (
              <a
                className="text-white/60 hover:text-soft-pink px-3 py-1 transition-all"
                href="/dashboard"
              >
                Dashboard
              </a>
            ) : (
              <a
                className="text-white/60 hover:text-soft-pink px-3 py-1 transition-all"
                href="/"
              >
                Home
              </a>
            )}
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
              <div className="absolute right-0 mt-2 w-32 bg-dark-gray border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-charcoal rounded-lg font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-32 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="mb-12 relative">
          <h1 className="text-6xl md:text-7xl font-black italic text-white/5 absolute -top-8 -left-4 select-none uppercase tracking-tighter font-headline">
            Profile
          </h1>
          <h2 className="text-4xl font-extrabold text-white relative font-headline tracking-tight">
            Akun Saya
          </h2>
          <p className="text-white/60 mt-2 max-w-md relative z-10 text-sm">
            Kelola pesanan tiket, informasi profil, dan atur preferensi keamanan
            Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* SIDEBAR */}
          <aside className="md:col-span-3 space-y-2 sticky top-28">
            <button
              onClick={() => setActiveMenu("history")}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeMenu === "history" ? "bg-dark-gray text-soft-pink border border-white/5 shadow-[0_0_15px_rgba(255,143,199,0.1)]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              <span className="material-symbols-outlined">receipt_long</span>{" "}
              Pesanan Saya
            </button>
            <button
              onClick={() => setActiveMenu("general")}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeMenu === "general" ? "bg-dark-gray text-soft-pink border border-white/5 shadow-[0_0_15px_rgba(255,143,199,0.1)]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              <span className="material-symbols-outlined">person</span> Profil
            </button>
            <button
              onClick={() => setActiveMenu("security")}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeMenu === "security" ? "bg-dark-gray text-soft-pink border border-white/5 shadow-[0_0_15px_rgba(255,143,199,0.1)]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              <span className="material-symbols-outlined">security</span>{" "}
              Security
            </button>
          </aside>

          {/* MAIN KONTEN */}
          <div className="md:col-span-9 bg-dark-gray border border-white/5 rounded-xl p-6 md:p-10 min-h-[500px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-soft-pink/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>

            {/* TAB 1: PESANAN SAYA */}
            {activeMenu === "history" && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold font-headline text-white mb-2 uppercase tracking-tighter">
                    Riwayat Tiket
                  </h3>
                  <p className="text-sm text-white/60">
                    Daftar semua transaksi dan E-Ticket Anda.
                  </p>
                </div>

                {isLoadingHistory ? (
                  <div className="text-center py-12 text-soft-pink animate-pulse font-bold tracking-widest">
                    MEMUAT DATA...
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="bg-charcoal border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center">
                    <span className="material-symbols-outlined text-6xl text-white/10 mb-4">
                      confirmation_number
                    </span>
                    <p className="text-white/60 mb-6">
                      Anda belum membeli tiket apapun.
                    </p>
                    <Link
                      to="/"
                      className="text-charcoal bg-soft-pink font-bold px-8 py-3 rounded-xl hover:brightness-110 transition-all uppercase tracking-widest text-sm"
                    >
                      Eksplor Event
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((trx) => {
                      // 🔴 CEK APAKAH WAKTU EVENT SUDAH LEWAT 🔴
                      const isEventPast =
                        new Date(trx.event.event_date).getTime() <
                        new Date().getTime();
                      // const canReview = trx.status === "success" && isEventPast;
                      // 🔴 UNTUK TESTING: Munculkan tombol asalkan statusnya success (Abaikan waktu event)
                      const canReview = trx.status === "success";

                      return (
                        <div
                          key={trx.id}
                          className="bg-charcoal border border-white/5 rounded-xl p-6 hover:border-soft-pink/30 transition-all flex flex-col sm:flex-row gap-6 shadow-lg relative overflow-hidden group"
                        >
                          <div className="flex-1 space-y-3 relative z-10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold text-white/40 tracking-widest">
                                ORDER ID: #TRX-{trx.id}
                              </span>
                              {getStatusBadge(trx.status)}
                            </div>
                            <h3 className="font-headline font-black text-xl text-white uppercase italic tracking-tighter line-clamp-1 group-hover:text-soft-pink transition-colors">
                              {trx.event.title}
                            </h3>
                            <div className="text-sm text-white/60 space-y-1">
                              <p>
                                <span className="text-soft-pink font-bold">
                                  {trx.quantity}x
                                </span>{" "}
                                {trx.ticket_type.name}
                              </p>
                              <p className="flex items-center gap-1 text-[11px] uppercase tracking-widest">
                                <span className="material-symbols-outlined text-[14px]">
                                  event
                                </span>{" "}
                                {new Date(
                                  trx.event.event_date,
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col justify-between sm:items-end border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6 min-w-[160px] relative z-10">
                            <div className="text-left sm:text-right">
                              <p className="text-[10px] text-white/40 uppercase tracking-widest">
                                Total Bayar
                              </p>
                              <p className="font-black text-lg text-white">
                                Rp {trx.final_price.toLocaleString("id-ID")}
                              </p>
                            </div>

                            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              {/* Jika masih belum sukses/selesai, cukup 1 tombol biasa */}
                              {trx.status === "pending" ||
                              trx.status === "rejected" ? (
                                <Link
                                  to={`/transactions/${trx.id}`}
                                  className="w-full px-6 py-3 rounded-xl text-center text-xs font-bold uppercase tracking-widest stage-gradient text-charcoal shadow-[0_0_15px_rgba(255,143,199,0.3)] hover:scale-105 active:scale-95 transition-all"
                                >
                                  Upload Bukti
                                </Link>
                              ) : (
                                <>
                                  <Link
                                    to={`/transactions/${trx.id}`}
                                    className="px-6 py-2 rounded-xl text-center text-xs font-bold uppercase tracking-widest border border-white/20 text-white hover:bg-white/10 transition-all"
                                  >
                                    Detail
                                  </Link>

                                  {/* 🔴 TOMBOL BERI ULASAN MUNCUL DI SINI JIKA BISA DI-REVIEW 🔴 */}
                                  {canReview && (
                                    <button
                                      onClick={() =>
                                        openReviewModal(
                                          trx.event_id,
                                          trx.event.title,
                                        )
                                      }
                                      className="px-6 py-2 rounded-xl text-center text-xs font-bold uppercase tracking-widest border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 transition-all flex items-center justify-center gap-1"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">
                                        star
                                      </span>{" "}
                                      Ulasan
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: GENERAL (PROFIL) */}
            {activeMenu === "general" && (
              <div className="animate-in fade-in duration-300">
                {/* Kode form profil asli Anda */}
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
                    <h3 className="text-xl font-bold font-headline text-white uppercase tracking-tighter">
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
                      className="flex-[2] stage-gradient text-charcoal py-4 rounded-lg font-bold text-lg hover:brightness-110 transition-all uppercase tracking-widest"
                      type="submit"
                    >
                      Simpan Perubahan
                    </button>
                    <button
                      className="flex-1 border border-white/20 text-white/60 py-4 rounded-lg font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-sm"
                      type="button"
                      onClick={handleCancel}
                    >
                      Batalkan
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: SECURITY (PASSWORD) */}
            {activeMenu === "security" && (
              <div className="animate-in fade-in duration-300">
                {/* Kode form security asli Anda */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold font-headline text-white mb-2 uppercase tracking-tighter">
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
                    className="w-full mt-8 py-4 rounded-lg stage-gradient text-charcoal font-bold text-lg hover:brightness-110 transition-all disabled:opacity-50 uppercase tracking-widest"
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

      {/* 🔴 MODAL POPUP REVIEW 🔴 */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-dark-gray border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-headline font-black italic uppercase tracking-tighter text-white">
                    Beri Ulasan
                  </h3>
                  <p className="text-white/60 text-sm mt-1">
                    {reviewEventTitle}
                  </p>
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="text-white/40 hover:text-soft-pink transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* 5 BINTANG INTERAKTIF */}
                <div className="flex flex-col items-center justify-center py-4 bg-charcoal rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
                    Rating Anda
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setRating(star)}
                        className={`material-symbols-outlined text-4xl cursor-pointer transition-all hover:scale-110 ${star <= rating ? "text-yellow-400" : "text-white/10"}`}
                        style={{
                          fontVariationSettings:
                            star <= rating ? "'FILL' 1" : "'FILL' 0",
                        }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-white/60">
                    Ulasan Event
                  </label>
                  <textarea
                    className="w-full bg-charcoal border border-white/10 rounded-lg p-4 text-white focus:ring-1 focus:ring-soft-pink/50 outline-none resize-none text-sm"
                    rows={3}
                    placeholder="Ceritakan pengalaman seru Anda di acara ini!"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-white/60">
                    Saran (Opsional)
                  </label>
                  <textarea
                    className="w-full bg-charcoal border border-white/10 rounded-lg p-4 text-white focus:ring-1 focus:ring-soft-pink/50 outline-none resize-none text-sm"
                    rows={2}
                    placeholder="Ada saran untuk penyelenggara di masa depan?"
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview || !feedback}
                  className="w-full stage-gradient text-charcoal font-bold text-lg py-4 rounded-xl uppercase tracking-widest shadow-[0_0_15px_rgba(255,143,199,0.3)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmittingReview ? "Mengirim..." : "Kirim Ulasan"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
