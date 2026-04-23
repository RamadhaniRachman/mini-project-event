import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function TransactionVerificationCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8000/api/transactions/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const result = await response.json();
          setTransaction(result.data);
        } else {
          alert("Gagal memuat data transaksi.");
          navigate("/profile");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [id, navigate]);

  useEffect(() => {
    if (
      !transaction ||
      transaction.status !== "pending" ||
      !transaction.expires_at
    )
      return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expired = new Date(transaction.expires_at).getTime();
      const distance = expired - now;

      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft("00:00:00");
        setTransaction((prev: any) => ({ ...prev, status: "expired" }));
        return;
      }

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [transaction]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) return alert("Pilih file bukti pembayaran dulu!");

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("payment_proof", proofFile);

      const res = await fetch(
        `http://localhost:8000/api/transactions/${id}/upload-proof`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      const result = await res.json();

      if (res.ok) {
        alert(
          "Bukti pembayaran berhasil diunggah! Mohon tunggu konfirmasi admin.",
        );
        setTransaction(result.data);
      } else {
        alert("Gagal mengunggah: " + result.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return {
          text: "Menunggu Pembayaran",
          color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
        };
      case "waiting_admin":
        return {
          text: "Menunggu Konfirmasi",
          color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
        };
      case "success":
        return {
          text: "Transaksi Berhasil",
          color: "text-green-400 bg-green-400/10 border-green-400/20",
        };
      case "rejected":
        return {
          text: "Pembayaran Ditolak",
          color: "text-red-400 bg-red-400/10 border-red-400/20",
        };
      case "expired":
        return {
          text: "Kedaluwarsa",
          color: "text-white/40 bg-white/5 border-white/10",
        };
      case "cancelled":
        return {
          text: "Dibatalkan",
          color: "text-red-500 bg-red-500/10 border-red-500/20",
        };
      default:
        return {
          text: "Unknown",
          color: "text-white bg-white/10 border-white/20",
        };
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-charcoal flex justify-center items-center text-soft-pink font-bold animate-pulse text-2xl tracking-widest">
        MEMUAT DATA...
      </div>
    );
  if (!transaction) return null;

  const badge = getStatusBadge(transaction.status);

  return (
    // 👇 INI YANG BIKIN TAMPILAN JADI GELAP (Tadi hilang di kode Anda)
    <div className="dark bg-charcoal font-body text-white min-h-screen selection:bg-soft-pink selection:text-charcoal pb-24 md:pb-0">
      <header className="fixed top-0 w-full z-50 bg-charcoal/80 backdrop-blur-xl shadow-lg border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-screen-2xl mx-auto">
          <button
            onClick={() => navigate("/profile")}
            className="text-soft-pink hover:text-light-pink transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-2xl font-black text-soft-pink tracking-widest font-headline italic uppercase">
            NEON STAGE
          </h1>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="pt-28 pb-12 px-6 max-w-xl mx-auto">
        <div className="bg-dark-gray border border-white/5 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-soft-pink/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <h1 className="font-headline text-3xl font-black italic uppercase tracking-tighter text-white mb-2">
            Detail Transaksi
          </h1>
          <p className="text-white/60 text-sm mb-8">
            Order ID:{" "}
            <span className="font-bold text-soft-pink">
              #TRX-{transaction.id}
            </span>
          </p>

          <div
            className={`border rounded-xl p-4 mb-8 flex items-center justify-between ${badge.color}`}
          >
            <span className="font-bold uppercase tracking-wider text-xs">
              {badge.text}
            </span>
            <span className="material-symbols-outlined">
              {transaction.status === "success"
                ? "check_circle"
                : transaction.status === "pending"
                  ? "schedule"
                  : "info"}
            </span>
          </div>

          {transaction.status === "pending" && (
            <div className="bg-charcoal border border-white/10 rounded-xl p-6 text-center mb-8 shadow-inner relative overflow-hidden">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-white/60 mb-2">
                Sisa Waktu Pembayaran
              </p>
              <div className="text-5xl font-black font-headline text-soft-pink tracking-widest animate-pulse">
                {timeLeft || "00:00:00"}
              </div>
            </div>
          )}

          {(transaction.status === "pending" ||
            transaction.status === "rejected") && (
            <form
              onSubmit={handleUpload}
              className="space-y-4 border-t border-white/10 pt-8 mt-4"
            >
              <h3 className="font-bold text-white uppercase tracking-widest text-sm mb-4">
                Unggah Bukti Transfer
              </h3>
              <label className="block border-2 border-dashed border-white/20 hover:border-soft-pink/50 rounded-xl p-8 text-center cursor-pointer transition-colors bg-charcoal/50 group">
                <span className="material-symbols-outlined text-4xl text-soft-pink mb-2 group-hover:scale-110 transition-transform">
                  upload_file
                </span>
                <p className="text-sm font-bold text-white">
                  Klik untuk memilih file
                </p>
                <p className="text-xs text-soft-pink mt-2 font-bold">
                  {proofFile ? proofFile.name : "Format JPG, PNG (Maks 2MB)"}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setProofFile(e.target.files ? e.target.files[0] : null)
                  }
                />
              </label>

              <button
                type="submit"
                disabled={isUploading || !proofFile}
                className="w-full stage-gradient text-charcoal font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(255,143,199,0.3)] hover:brightness-110 disabled:opacity-50 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2 mt-4"
              >
                {isUploading ? "Mengunggah..." : "Kirim Bukti"}
                {!isUploading && (
                  <span className="material-symbols-outlined text-sm">
                    send
                  </span>
                )}
              </button>
            </form>
          )}

          {transaction.status === "waiting_admin" && (
            <div className="text-center py-8 border-t border-white/10 mt-8">
              <span className="material-symbols-outlined text-6xl text-blue-400 mb-4 animate-bounce">
                hourglass_empty
              </span>
              <p className="text-white/80 font-bold text-lg">
                Bukti Sedang Diproses
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
