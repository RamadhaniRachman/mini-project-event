import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  totalRegistrations: number;
  occupancyRate: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
    totalRegistrations: 0,
    occupancyRate: 0,
  });
  const [events, setEvents] = useState<any[]>([]);
  const [recentTrans, setRecentTrans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Data Tren (Bisa Harian / Bulanan sesuai klik)
  const [trendMode, setTrendMode] = useState<"Harian" | "Bulanan">("Bulanan");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, eventsRes] = await Promise.all([
          fetch("http://localhost:8000/api/events/stats", { headers }),
          fetch("http://localhost:8000/api/events/list", { headers }),
        ]);

        if (statsRes.ok && eventsRes.ok) {
          const statsData = await statsRes.json();
          const eventsData = await eventsRes.json();

          setStats(statsData.stats);
          setRecentTrans(statsData.recentTransactions || []);
          setEvents(eventsData.data || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatRupiah = (angka: number) => {
    if (angka >= 1000000000) return `Rp ${(angka / 1000000000).toFixed(1)}M`;
    if (angka >= 1000000) return `Rp ${(angka / 1000000).toFixed(1)}Jt`;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Kalkulasi sederhana untuk garis SVG lingkar kapasitas (Max 440)
  // Mock data Tren (Karena kita tidak menarik data API Reports di halaman ini, kita buat visual dummy yang bereaksi thd klik)
  const trendBars =
    trendMode === "Bulanan"
      ? [20, 65, 55, 85, 95, 75, 60, 80] // Bulanan
      : [10, 30, 20, 50, 40, 70, 60]; // Harian (7 hari)

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-500">
      {/* --- Section 1: Summary Stats --- */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-headline text-2xl font-extrabold tracking-tight">
              Ringkasan Performa
            </h3>
            <p className="text-white/70 text-sm">Data statistik event Anda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-dark-gray p-6 rounded-xl space-y-4 border border-white/5 group hover:border-soft-pink transition-all">
            <div className="p-3 rounded-lg bg-soft-pink/10 text-soft-pink w-fit group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div>
              <p className="text-white/70 text-xs font-label uppercase tracking-widest">
                Total Penjualan
              </p>
              <h4 className="text-2xl font-black mt-1">
                {isLoading ? "..." : formatRupiah(stats.totalRevenue)}
              </h4>
            </div>
          </div>
          <div className="bg-dark-gray p-6 rounded-xl space-y-4 border border-white/5 group hover:border-soft-pink transition-all">
            <div className="p-3 rounded-lg bg-soft-pink/10 text-soft-pink w-fit group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">
                confirmation_number
              </span>
            </div>
            <div>
              <p className="text-white/70 text-xs font-label uppercase tracking-widest">
                Tiket Terjual
              </p>
              <h4 className="text-2xl font-black mt-1">
                {isLoading ? "..." : stats.totalTicketsSold}
              </h4>
            </div>
          </div>
          <div className="bg-dark-gray p-6 rounded-xl space-y-4 border border-white/5 group hover:border-soft-pink transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-lg bg-soft-pink/10 text-soft-pink group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">festival</span>
              </div>
            </div>
            <div>
              <p className="text-white/70 text-xs font-label uppercase tracking-widest">
                Event Aktif
              </p>
              <h4 className="text-2xl font-black mt-1">
                {isLoading ? "..." : stats.totalEvents}
              </h4>
            </div>
          </div>
          <div className="bg-dark-gray p-6 rounded-xl space-y-4 border border-white/5 group hover:border-soft-pink transition-all">
            <div className="p-3 rounded-lg bg-soft-pink/10 text-soft-pink w-fit group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">person_add</span>
            </div>
            <div>
              <p className="text-white/70 text-xs font-label uppercase tracking-widest">
                Peserta / Registrasi
              </p>
              <h4 className="text-2xl font-black mt-1">
                {isLoading ? "..." : stats.totalRegistrations}
              </h4>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: My Events Grid --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-2xl font-extrabold tracking-tight">
            Event Saya
          </h3>
          <Link
            to="/dashboard/events"
            className="text-soft-pink text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:underline"
          >
            Lihat Semua{" "}
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        </div>
        {isLoading ? (
          <div className="py-12 text-center text-soft-pink animate-pulse font-bold">
            MEMUAT EVENT...
          </div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center text-white/40 border border-white/5 border-dashed rounded-xl">
            Anda belum membuat event apapun.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {events.slice(0, 3).map((event) => {
              const totalCapacity =
                event.tickets?.reduce(
                  (acc: any, curr: any) => acc + curr.available_seats,
                  0,
                ) || 0;
              const isSoldOut = totalCapacity === 0;
              const API_URL = import.meta.env.VITE_PROJECT_API;
              const imageSrc = event.image_url
                ? event.image_url.startsWith("http")
                  ? event.image_url
                  : `${API_URL}${event.image_url}`
                : "https://images.unsplash.com/photo-1540039155732-684735035727?auto=format&fit=crop&q=80&w=800";

              return (
                <div
                  key={event.id}
                  className="bg-dark-gray rounded-xl overflow-hidden group border border-white/5 flex flex-col hover:border-soft-pink/30 transition-all"
                >
                  <div className="h-48 relative overflow-hidden shrink-0">
                    <img
                      className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 ${isSoldOut ? "grayscale" : ""}`}
                      alt={event.title}
                      src={imageSrc}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-gray via-transparent to-transparent"></div>
                    <div
                      className={`absolute top-4 left-4 ${isSoldOut ? "bg-red-500/90" : "bg-green-500/90"} text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full`}
                    >
                      {isSoldOut ? "Sold Out" : "On Sale"}
                    </div>
                  </div>
                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <h4 className="text-lg font-bold group-hover:text-soft-pink transition-colors leading-tight line-clamp-2">
                      {event.title}
                    </h4>
                    <div className="pt-4 mt-auto border-t border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-white/70 uppercase">
                          Kapasitas
                        </p>
                        <p
                          className={`text-sm font-bold ${isSoldOut ? "text-red-400" : "text-white"}`}
                        >
                          {totalCapacity} Kursi
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/70 uppercase text-right">
                          Tiket
                        </p>
                        <p className="text-sm font-bold text-soft-pink text-right">
                          {event.tickets?.length || 0} Varian
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* --- Section 4: Recent Transactions (Dinamis) --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-2xl font-extrabold tracking-tight">
            Transaksi Terbaru
          </h3>
        </div>
        <div className="bg-dark-gray border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-charcoal/50 border-b border-white/10">
                  <th className="px-6 py-4 text-[10px] uppercase text-white/60">
                    Pembeli
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase text-white/60">
                    Event
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase text-white/60">
                    Tiket
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase text-white/60">
                    Jumlah
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase text-white/60">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-[10px] uppercase text-white/60 text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-soft-pink animate-pulse"
                    >
                      Memuat...
                    </td>
                  </tr>
                ) : recentTrans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-white/40">
                      Belum ada transaksi.
                    </td>
                  </tr>
                ) : (
                  recentTrans.map((trx) => (
                    <tr
                      key={trx.id}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/dashboard/transactions/${trx.id}`)
                      }
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-charcoal border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                            {trx.user?.name?.substring(0, 2).toUpperCase() ||
                              "NN"}
                          </div>
                          <div>
                            <p className="text-sm font-bold truncate max-w-[120px]">
                              {trx.user?.name}
                            </p>
                            <p className="text-[10px] text-white/40">
                              {trx.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm truncate max-w-[150px]">
                        {trx.event?.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase whitespace-nowrap">
                          {trx.quantity}x {trx.ticket_type?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-white whitespace-nowrap">
                        {formatRupiah(trx.final_price)}
                      </td>
                      <td className="px-6 py-4 text-xs text-white/40 whitespace-nowrap">
                        {formatDate(trx.created_at)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {trx.status === "success" && (
                          <span className="text-[10px] font-bold uppercase text-green-400">
                            Berhasil
                          </span>
                        )}
                        {trx.status === "pending" && (
                          <span className="text-[10px] font-bold uppercase text-yellow-400 animate-pulse">
                            Menunggu
                          </span>
                        )}
                        {trx.status === "rejected" && (
                          <span className="text-[10px] font-bold uppercase text-red-400">
                            Ditolak
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-charcoal/50 flex justify-center border-t border-white/10">
            <Link
              to="/dashboard/transactions"
              className="px-6 py-2 text-xs font-bold uppercase border border-white/20 rounded-lg hover:bg-white/10 transition-all"
            >
              Lihat Semua
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
