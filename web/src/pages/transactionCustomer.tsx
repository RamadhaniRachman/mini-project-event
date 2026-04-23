import React, { useEffect, useState } from "react";

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

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

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
  }, []);

  // Format Rupiah
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Format Tanggal & Jam
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} • ${date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
  };

  // Fitur Live Search
  const filteredTransactions = transactions.filter((trx) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      trx.user?.name?.toLowerCase().includes(searchLower) ||
      trx.user?.email?.toLowerCase().includes(searchLower) ||
      trx.event?.title?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 text-white">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-white">
            RIWAYAT <span className="text-soft-pink">TRANSAKSI</span>
          </h2>
          <p className="text-white/60 text-sm mt-2 max-w-xl">
            Pantau semua penjualan tiket secara real-time. Setiap pembelian
            sukses akan otomatis tercatat di sini.
          </p>
        </div>

        {/* Search Bar & Export */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
              search
            </span>
            <input
              className="w-full bg-dark-gray border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:ring-1 focus:border-soft-pink outline-none transition-all"
              placeholder="Cari pembeli / event..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="bg-charcoal hover:bg-dark-gray border border-white/10 hover:border-soft-pink/50 text-white font-bold px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all text-sm whitespace-nowrap">
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-dark-gray rounded-2xl overflow-hidden shadow-2xl border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-charcoal/50 border-b border-white/10">
                <th className="px-6 py-5 text-xs font-label uppercase tracking-widest text-white/60">
                  ID Transaksi
                </th>
                <th className="px-6 py-5 text-xs font-label uppercase tracking-widest text-white/60">
                  Pembeli
                </th>
                <th className="px-6 py-5 text-xs font-label uppercase tracking-widest text-white/60">
                  Event & Tiket
                </th>
                <th className="px-6 py-5 text-xs font-label uppercase tracking-widest text-white/60">
                  Waktu Pembelian
                </th>
                <th className="px-6 py-5 text-xs font-label uppercase tracking-widest text-white/60 text-right">
                  Total Bayar
                </th>
                <th className="px-6 py-5 text-xs font-label uppercase tracking-widest text-white/60 text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-soft-pink font-bold animate-pulse"
                  >
                    MEMUAT DATA TRANSAKSI...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <span className="material-symbols-outlined text-5xl text-white/20 mb-3 block">
                      receipt_long
                    </span>
                    <p className="text-white/60 italic">
                      Belum ada transaksi yang ditemukan.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => (
                  <tr
                    key={trx.id}
                    className="hover:bg-charcoal transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-white/60">
                      #TRX-{trx.id.toString().padStart(5, "0")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-soft-pink/10 border border-soft-pink/20 flex items-center justify-center text-[10px] font-bold text-soft-pink">
                          {trx.user?.name?.substring(0, 2).toUpperCase() ||
                            "NN"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white whitespace-nowrap">
                            {trx.user?.name || "Anonim"}
                          </p>
                          <p className="text-[10px] text-white/40">
                            {trx.user?.email || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-white/90 line-clamp-1 max-w-[250px]">
                        {trx.event?.title || "-"}
                      </p>
                      <p className="text-xs text-soft-pink mt-1 font-semibold">
                        {trx.quantity}x {trx.ticket_type?.name || "Tiket"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60 whitespace-nowrap">
                      {formatDateTime(trx.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-black text-white">
                        {formatRupiah(trx.final_price)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">
                          Berhasil
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && filteredTransactions.length > 0 && (
          <div className="px-6 py-4 bg-charcoal/30 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-white/40">
              Menampilkan {filteredTransactions.length} transaksi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
