import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function TransactionVerification() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // State untuk Form Penolakan
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState(
    "Bukti Transfer Tidak Terbaca/Buram",
  );
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      navigate("/login");
      return;
    }
    const userData = JSON.parse(userString);
    if (String(userData.role || "").toLowerCase() !== "organizer") {
      navigate("/");
      return;
    }
    setUser(userData);

    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:8000/api/transactions/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const result = await res.json();
          setTransaction(result.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, navigate]);

  const handleVerify = async (action: "ACCEPT" | "REJECT") => {
    if (action === "ACCEPT") {
      if (!confirm("Apakah Anda yakin ingin MENERIMA transaksi ini?")) return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/api/transactions/${id}/verify`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // Kita bisa mengirimkan reason & note ke backend jika nanti tabel database Anda di-update
          body: JSON.stringify({
            action,
            reason: rejectReason,
            note: rejectNote,
          }),
        },
      );
      const result = await res.json();

      if (res.ok) {
        alert(result.message);
        navigate("/dashboard/transactions"); // Kembali ke list setelah sukses
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !transaction) {
    return (
      <div className="min-h-screen bg-charcoal flex justify-center items-center text-soft-pink font-bold text-xl animate-pulse">
        MEMUAT DATA...
      </div>
    );
  }

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  const formatDate = (date: string) =>
    new Date(date).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 text-white">
      {/* Breadcrumb & Title */}
      <div>
        <p
          className="font-label text-xs tracking-[0.2em] text-light-pink uppercase mb-2 font-bold flex items-center gap-2 cursor-pointer hover:underline w-fit"
          onClick={() => navigate("/dashboard/transactions")}
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>{" "}
          Kembali ke Daftar Transaksi
        </p>
        <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter italic uppercase">
          Detail Transaksi
        </h2>
        <p className="text-white/60 mt-3 max-w-2xl text-sm leading-relaxed">
          Harap tinjau bukti pembayaran di bawah ini dengan seksama sebelum
          melakukan konfirmasi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Evidence */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-dark-gray rounded-xl overflow-hidden border border-white/5 shadow-2xl">
            <div className="px-6 py-4 bg-charcoal border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="font-headline font-bold text-lg text-soft-pink">
                Bukti Pembayaran
              </span>
              <span className="font-label text-[10px] tracking-widest text-light-pink px-2 py-1 bg-soft-pink/10 rounded border border-soft-pink/20 w-fit">
                SYSTEM_GENERATED
              </span>
            </div>
            <div className="p-4 bg-[#0a0a0b] flex justify-center items-center">
              <div className="relative group cursor-zoom-in overflow-hidden rounded-md border border-white/5 max-w-md w-full">
                <img
                  className="w-full aspect-[3/4] object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  alt="Proof of Payment"
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-transparent flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-sm font-medium text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      fullscreen
                    </span>{" "}
                    Klik untuk memperbesar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Info & Actions */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          <div className="bg-dark-gray p-6 rounded-xl border border-white/5 border-l-4 border-l-soft-pink shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-label text-[10px] tracking-widest text-white/40 uppercase font-bold">
                  Transaction ID
                </p>
                <h3 className="text-xl font-bold mt-1 font-mono text-white">
                  #TRX-{transaction.id.toString().padStart(5, "0")}
                </h3>
              </div>
              <span
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border whitespace-nowrap ${transaction.status === "pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : transaction.status === "success" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}
              >
                {transaction.status === "pending"
                  ? "Menunggu Verifikasi"
                  : transaction.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-[10px] text-white/40 uppercase font-bold">
                  Metode
                </p>
                <p className="text-sm font-semibold text-white mt-1">
                  Transfer Bank
                </p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase font-bold">
                  Tanggal
                </p>
                <p className="text-sm font-semibold text-white mt-1">
                  {formatDate(transaction.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-dark-gray p-6 rounded-xl border border-white/5 shadow-lg">
            <h4 className="font-headline font-bold text-sm text-soft-pink mb-4 uppercase tracking-wider border-b border-white/5 pb-2">
              Informasi Pembeli
            </h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-soft-pink/30 bg-charcoal flex items-center justify-center font-bold text-soft-pink">
                {transaction.user.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-tight">
                  {transaction.user.name}
                </p>
                <p className="text-xs text-white/60">
                  {transaction.user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="bg-dark-gray p-6 rounded-xl border border-white/5 shadow-lg">
            <h4 className="font-headline font-bold text-sm text-soft-pink mb-4 uppercase tracking-wider border-b border-white/5 pb-2">
              Detail Pesanan
            </h4>
            <div className="space-y-4">
              <div className="p-4 bg-charcoal border border-white/5 rounded-lg">
                <p className="text-xs text-light-pink font-bold mb-1 uppercase tracking-tighter">
                  Event
                </p>
                <p className="text-md font-bold text-white leading-tight">
                  {transaction.event.title}
                </p>
              </div>
              <div className="space-y-3 px-1">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-white/40">
                      Kategori
                    </p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {transaction.quantity}x {transaction.ticket_type.name}
                    </p>
                  </div>
                </div>
                <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-center">
                  <p className="text-xs text-white/60 font-bold uppercase tracking-widest">
                    Total Pembayaran
                  </p>
                  <p className="text-2xl font-black text-soft-pink italic tracking-tighter">
                    {formatRupiah(transaction.final_price)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {transaction.status === "pending" && !showRejectForm && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => setShowRejectForm(true)}
                className="flex items-center justify-center gap-2 py-4 rounded-lg font-headline font-bold text-sm text-red-400 bg-charcoal border border-red-500/30 hover:bg-red-500/10 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">close</span>{" "}
                Tolak
              </button>
              <button
                disabled={isProcessing}
                onClick={() => handleVerify("ACCEPT")}
                className="flex items-center justify-center gap-2 py-4 rounded-lg font-headline font-bold text-sm text-charcoal stage-gradient shadow-[0_0_20px_rgba(255,143,199,0.3)] hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>{" "}
                Terima
              </button>
            </div>
          )}
        </div>
      </div>

      {/* REJECTION FORM (Hanya muncul jika klik Tolak) */}
      {showRejectForm && (
        <div className="mt-16 max-w-3xl mx-auto border-t border-white/5 pt-12 animate-in fade-in slide-in-from-bottom-8">
          <div className="bg-dark-gray p-6 md:p-8 rounded-xl border border-red-500/20 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-9xl text-red-500">
                warning
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">
                  gpp_maybe
                </span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-white mb-1 font-headline">
                    Alasan Penolakan
                  </h3>
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="text-white/40 hover:text-white text-sm underline"
                  >
                    Batal
                  </button>
                </div>
                <p className="text-sm text-white/60">
                  Sampaikan alasan mengapa transaksi ini ditolak kepada pembeli.
                </p>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="font-label text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Pilih Alasan Utama
                </label>
                <select
                  className="w-full bg-charcoal border border-white/10 rounded-lg text-white py-3 px-4 focus:ring-1 focus:ring-red-400/50 outline-none cursor-pointer"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                >
                  <option className="bg-dark-gray">
                    Bukti Transfer Tidak Terbaca/Buram
                  </option>
                  <option className="bg-dark-gray">
                    Nominal Transfer Tidak Sesuai
                  </option>
                  <option className="bg-dark-gray">
                    Nama Pengirim Berbeda Jauh
                  </option>
                  <option className="bg-dark-gray">
                    Bukti Transfer Terindikasi Palsu
                  </option>
                  <option className="bg-dark-gray">Lainnya</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-label text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  className="w-full bg-charcoal border border-white/10 rounded-lg text-white py-3 px-4 focus:ring-1 focus:ring-red-400/50 outline-none placeholder:text-white/20 resize-y"
                  placeholder="Tulis instruksi tambahan untuk pembeli..."
                  rows={3}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                ></textarea>
              </div>

              <div className="p-4 bg-charcoal rounded-lg border border-red-500/10 space-y-3">
                <p className="text-[10px] font-bold text-red-400 flex items-center gap-2 uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm">
                    info
                  </span>{" "}
                  KONSEKUENSI PENOLAKAN:
                </p>
                <ul className="text-xs text-white/60 space-y-2 pl-1">
                  <li className="flex gap-2 items-start">
                    <span className="text-red-400">•</span> Poin dan voucher
                    yang digunakan akan otomatis dibatalkan.
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-red-400">•</span> Status kursi akan
                    dikembalikan menjadi tersedia untuk umum.
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-red-400">•</span> Notifikasi penolakan
                    akan dikirimkan ke pembeli.
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleVerify("REJECT")}
                disabled={isProcessing}
                className="w-full py-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 font-headline font-bold uppercase tracking-widest hover:bg-red-500/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing
                  ? "MEMPROSES..."
                  : "Konfirmasi Penolakan Transaksi"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="h-12 md:h-24"></div>
    </div>
  );
}
