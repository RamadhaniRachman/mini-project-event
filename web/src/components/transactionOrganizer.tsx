import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Transaction {
  id: number;
  created_at: string;
  quantity: number;
  final_price: number;
  status: string;
  user: { name: string; email: string };
  event: { title: string };
  ticket_type: { name: string };
}

export default function TransactionsOrganizer() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("Semua Status");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:8000/api/transactions/list",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const result = await response.json();
          setTransactions(result.data || []);
        }
      } catch (error) {
        console.error("Gagal mengambil transaksi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [navigate]);

  // Format Helpers
  const formatRupiah = (angka: number) => {
    if (angka >= 1000000000) return `Rp ${(angka / 1000000000).toFixed(1)}M`;
    if (angka >= 1000000) return `Rp ${(angka / 1000000).toFixed(1)}Jt`;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} • ${date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
  };

  // Kalkulasi Statistik Dinamis
  const totalPendapatan = transactions
    .filter((t) => t.status === "success")
    .reduce((sum, t) => sum + t.final_price, 0);
  const totalTiket = transactions
    .filter((t) => t.status === "success")
    .reduce((sum, t) => sum + t.quantity, 0);
  const pendingCount = transactions.filter(
    (t) => t.status === "pending",
  ).length;

  // Filter Data Tabel
  const filteredTransactions = transactions.filter((trx) => {
    if (filterStatus === "Semua Status") return true;
    if (filterStatus === "Berhasil") return trx.status === "success";
    if (filterStatus === "Menunggu") return trx.status === "pending";
    if (filterStatus === "Ditolak") return trx.status === "rejected";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-12 px-4 md:px-8 pt-6">
      {/* --- Page Header & Export --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-soft-pink font-bold text-xs tracking-[0.2em] uppercase mb-2 block">
            Management Center
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-white">
            Transaksi Terbaru
          </h2>
        </div>
        <div className="flex gap-3">
          <button className="bg-dark-gray hover:bg-charcoal text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all border border-white/10">
            <span className="material-symbols-outlined text-lg">
              description
            </span>
            <span className="font-medium text-sm hidden sm:block">
              Export to CSV
            </span>
          </button>
          <button className="bg-dark-gray hover:bg-charcoal text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all border border-white/10">
            <span className="material-symbols-outlined text-lg">
              picture_as_pdf
            </span>
            <span className="font-medium text-sm hidden sm:block">
              Export to PDF
            </span>
          </button>
        </div>
      </div>

      {/* --- Summary Stats Bento Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Stat 1 */}
        <div className="bg-dark-gray border border-white/5 p-8 rounded-xl border-l-4 border-l-soft-pink relative overflow-hidden group hover:bg-charcoal transition-all">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-9xl">payments</span>
          </div>
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-4">
            Total Pendapatan
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">
              {isLoading ? "..." : formatRupiah(totalPendapatan)}
            </span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-dark-gray border border-white/5 p-8 rounded-xl border-l-4 border-l-white/20 relative overflow-hidden group hover:bg-charcoal transition-all">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-9xl">
              confirmation_number
            </span>
          </div>
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-4">
            Tiket Terjual
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">
              {isLoading ? "..." : totalTiket}
            </span>
            <span className="text-light-pink text-xs font-bold">Units</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-dark-gray border border-white/5 p-8 rounded-xl border-l-4 border-l-yellow-400 relative overflow-hidden group hover:bg-charcoal transition-all">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-9xl">
              pending_actions
            </span>
          </div>
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-4">
            Menunggu Verifikasi
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-yellow-400">
              {isLoading ? "..." : pendingCount}
            </span>
            <span className="text-yellow-400/60 text-xs font-bold">
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* --- Detailed Transactions Table Section --- */}
      <div className="bg-dark-gray border border-white/5 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 md:px-8 py-6 border-b border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-charcoal">
          <h3 className="font-bold text-lg text-light-pink">
            Riwayat Pembayaran
          </h3>
          <div className="flex items-center gap-4">
            <select
              className="bg-dark-gray border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-soft-pink cursor-pointer outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Berhasil">Berhasil</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="text-white/40 text-[10px] font-black tracking-[0.2em] uppercase bg-charcoal/50">
                <th className="px-8 py-5">ID Transaksi</th>
                <th className="px-8 py-5">Pembeli</th>
                <th className="px-8 py-5">Event</th>
                <th className="px-8 py-5">Tipe Tiket</th>
                <th className="px-8 py-5 text-right">Jumlah</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-8 py-12 text-center text-soft-pink font-bold animate-pulse"
                  >
                    MEMUAT DATA...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-8 py-12 text-center text-white/40 italic"
                  >
                    Belum ada transaksi ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => (
                  <tr
                    key={trx.id}
                    onClick={() =>
                      navigate(`/dashboard/transactions/${trx.id}`)
                    }
                    className="hover:bg-white/5 transition-colors group cursor-pointer relative"
                  >
                    <td className="px-8 py-6 font-mono text-xs text-soft-pink">
                      #TRX-{trx.id.toString().padStart(5, "0")}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center text-[10px] font-bold border border-white/10 text-white">
                          {trx.user?.name?.substring(0, 2).toUpperCase() ||
                            "NN"}
                        </div>
                        <div>
                          <p className="text-sm font-bold truncate max-w-[120px]">
                            {trx.user?.name}
                          </p>
                          <p className="text-[10px] text-white/40 truncate max-w-[120px]">
                            {trx.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm truncate max-w-[150px]">
                      {trx.event?.title}
                    </td>
                    <td className="px-8 py-6">
                      <span className="bg-charcoal text-white/80 border border-white/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                        {trx.ticket_type?.name}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right text-sm font-bold text-white whitespace-nowrap">
                      {formatRupiah(trx.final_price)}
                    </td>
                    <td className="px-8 py-6 text-center">
                      {trx.status === "success" && (
                        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>{" "}
                          Berhasil
                        </span>
                      )}
                      {trx.status === "pending" && (
                        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>{" "}
                          Menunggu
                        </span>
                      )}
                      {trx.status === "rejected" && (
                        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>{" "}
                          Ditolak
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-xs text-white/40 whitespace-nowrap">
                      {formatDateTime(trx.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredTransactions.length > 0 && (
          <div className="px-8 py-6 border-t border-white/10 bg-charcoal/50 flex justify-between items-center">
            <p className="text-xs text-white/40 italic">
              Menampilkan {filteredTransactions.length} transaksi
            </p>
          </div>
        )}
      </div>

      {/* --- Asymmetric Promotional Footer --- */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 bg-gradient-to-r from-dark-gray to-charcoal border border-white/5 p-8 md:p-10 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="font-headline text-xl md:text-2xl font-bold text-light-pink mb-2">
              Automated Payouts are Active
            </h4>
            <p className="text-white/60 text-sm max-w-md leading-relaxed">
              Dana hasil penjualan tiket akan secara otomatis ditransfer ke
              rekening utama Anda setiap hari Jumat pukul 00:00 WIB.
            </p>
          </div>
          <div className="absolute right-8 top-8 w-48 h-48 bg-soft-pink/10 blur-3xl rounded-full"></div>
        </div>
        <div className="md:col-span-4 bg-dark-gray p-8 rounded-xl flex flex-col items-center justify-center text-center gap-4 border border-soft-pink/10 h-full">
          <span className="material-symbols-outlined text-soft-pink text-4xl">
            verified_user
          </span>
          <div>
            <p className="text-sm font-bold text-white">Secure Settlement</p>
            <p className="text-[10px] text-white/40 mt-1">
              PCI-DSS Compliant Infrastructure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
