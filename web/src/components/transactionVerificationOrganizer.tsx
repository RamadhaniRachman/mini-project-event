import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function TransactionVerificationOrganizer() {
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
        navigate("/dashboard/transactions");
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
    // 👇 PERBAIKAN DI SINI: Ditambahkan min-h-screen bg-charcoal agar tidak putih
    <div className="min-h-screen bg-charcoal w-full">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 text-white">
        {/* Breadcrumb & Title */}
        <div>
          <p
            className="font-label text-xs tracking-[0.2em] text-light-pink uppercase mb-2 font-bold flex items-center gap-2 cursor-pointer hover:underline w-fit"
            onClick={() => navigate("/dashboard/transactions")}
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>{" "}
            Kembali ke Daftar
          </p>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter italic uppercase">
            Detail Transaksi
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Evidence */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-dark-gray rounded-xl overflow-hidden border border-white/5 shadow-2xl">
              <div className="px-6 py-4 bg-charcoal border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="font-headline font-bold text-lg text-soft-pink">
                  Bukti Pembayaran
                </span>
              </div>
              <div className="p-4 bg-[#0a0a0b] flex justify-center items-center">
                {transaction.payment_proof ? (
                  <div className="relative group cursor-zoom-in overflow-hidden rounded-md border border-white/5 max-w-md w-full">
                    <img
                      className="w-full aspect-[3/4] object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                      alt="Bukti Pembayaran"
                      src={transaction.payment_proof}
                    />
                    <a
                      href={transaction.payment_proof}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-4xl text-soft-pink">
                        zoom_in
                      </span>
                    </a>
                  </div>
                ) : (
                  <div className="w-full aspect-[3/4] flex flex-col items-center justify-center text-white/40 border border-dashed border-white/10 rounded-lg">
                    <span className="material-symbols-outlined text-4xl mb-2">
                      image_not_supported
                    </span>
                    <p className="text-sm">Belum ada bukti pembayaran</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Info & Actions */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
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
            </div>

            {/* Customer Info */}
            <div className="bg-dark-gray p-6 rounded-xl border border-white/5 shadow-lg">
              <h4 className="font-headline font-bold text-sm text-soft-pink mb-4 uppercase tracking-wider border-b border-white/5 pb-2">
                Informasi Pembeli
              </h4>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-soft-pink/30 bg-charcoal flex items-center justify-center font-bold text-soft-pink">
                  {transaction.user?.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-tight">
                    {transaction.user?.name}
                  </p>
                  <p className="text-xs text-white/60">
                    {transaction.user?.email}
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
                    {transaction.event?.title}
                  </p>
                </div>
                <div className="space-y-3 px-1">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-white/40">
                        Kategori
                      </p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {transaction.quantity}x {transaction.ticket_type?.name}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-center">
                    <p className="text-xs text-white/60 font-bold uppercase tracking-widest">
                      Total Ditransfer
                    </p>
                    <p className="text-2xl font-black text-soft-pink italic tracking-tighter">
                      {formatRupiah(transaction.final_price)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons (Hanya muncul jika status waiting_admin) */}
            {transaction.status === "waiting_admin" && !showRejectForm && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="flex items-center justify-center gap-2 py-4 rounded-lg font-headline font-bold text-sm text-red-400 bg-charcoal border border-red-500/30 hover:bg-red-500/10 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">
                    close
                  </span>{" "}
                  Tolak
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => handleVerify("ACCEPT")}
                  className="flex items-center justify-center gap-2 py-4 rounded-lg font-headline font-bold text-sm text-charcoal stage-gradient shadow-[0_0_20px_rgba(255,143,199,0.3)] hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">
                    check_circle
                  </span>{" "}
                  Terima
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MODAL PENOLAKAN */}
        {showRejectForm && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-dark-gray border border-red-500/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">
                Tolak Pembayaran?
              </h3>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs uppercase font-bold text-white/40 mb-2 block">
                    Alasan Utama
                  </label>
                  <select
                    className="w-full bg-charcoal border border-white/10 rounded-lg p-3 text-white outline-none"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  >
                    <option value="Bukti transfer buram/terpotong">
                      Bukti transfer buram/terpotong
                    </option>
                    <option value="Nominal transfer tidak sesuai">
                      Nominal transfer tidak sesuai
                    </option>
                    <option value="Bukti transfer palsu/editan">
                      Bukti transfer palsu/editan
                    </option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase font-bold text-white/40 mb-2 block">
                    Catatan Tambahan
                  </label>
                  <textarea
                    className="w-full bg-charcoal border border-white/10 rounded-lg p-3 text-white outline-none"
                    rows={3}
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="flex-1 border border-white/10 text-white hover:bg-white/5 py-3 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleVerify("REJECT")}
                  disabled={isProcessing}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 disabled:opacity-50"
                >
                  {isProcessing ? "Menolak..." : "Konfirmasi Tolak"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
