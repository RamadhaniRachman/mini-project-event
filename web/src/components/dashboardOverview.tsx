import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// 1. Definisi Tipe Data
interface Ticket {
  id: number;
  name: string;
  price: number;
  available_seats: number;
}

interface EventData {
  id: number;
  title: string;
  location: string;
  event_date: string;
  is_free: boolean;
  image_url: string | null;
  tickets: Ticket[];
}

interface DashboardStats {
  totalEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
  });
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = import.meta.env.VITE_PROJECT_API;

  // 2. Mengambil Data dari Backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Mengambil Stats dan Events secara bersamaan
        const [statsRes, eventsRes] = await Promise.all([
          fetch(`${API_URL}/api/events/stats`, { headers }),
          fetch(`${API_URL}/api/events/list`, { headers }),
        ]);

        if (statsRes.ok && eventsRes.ok) {
          const statsData = await statsRes.json();
          const eventsData = await eventsRes.json();

          setStats(statsData.stats);
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

  // 3. Formatter Rupiah & Tanggal
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
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-500">
      {/* --- Section 1: Summary Stats (Dinamis) --- */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-headline text-2xl font-extrabold tracking-tight">
              Ringkasan Performa
            </h3>
            <p className="text-white/70 text-sm">
              Data statistik event Anda hari ini
            </p>
          </div>
          <div className="inline-flex bg-dark-gray p-1 rounded-xl border border-white/5 overflow-x-auto max-w-full hide-scrollbar">
            <button className="px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all whitespace-nowrap">
              Harian
            </button>
            <button className="px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest bg-charcoal text-soft-pink shadow-inner transition-all border border-white/5 whitespace-nowrap">
              Semua Waktu
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-dark-gray p-6 rounded-xl space-y-4 hover:bg-charcoal border border-white/5 transition-all group">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-lg bg-soft-pink/10 text-soft-pink group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">payments</span>
              </div>
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
          <div className="bg-dark-gray p-6 rounded-xl space-y-4 hover:bg-charcoal border border-white/5 transition-all group">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-lg bg-soft-pink/10 text-soft-pink group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">
                  confirmation_number
                </span>
              </div>
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
          <div className="bg-dark-gray p-6 rounded-xl space-y-4 hover:bg-charcoal border border-white/5 transition-all group">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-lg bg-soft-pink/10 text-soft-pink group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">festival</span>
              </div>
              <span className="text-xs font-bold text-white/40 bg-charcoal px-2 py-1 rounded border border-white/5">
                Aktif
              </span>
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
          <div className="bg-dark-gray p-6 rounded-xl space-y-4 hover:bg-charcoal border border-white/5 transition-all group">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-lg bg-soft-pink/10 text-soft-pink group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">person_add</span>
              </div>
            </div>
            <div>
              <p className="text-white/70 text-xs font-label uppercase tracking-widest">
                Registrasi Baru
              </p>
              <h4 className="text-2xl font-black mt-1">12</h4>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: Data Visualization (Visual Statis) --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-dark-gray border border-white/5 rounded-2xl p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="font-headline text-xl font-bold">
                Tren Penjualan
              </h3>
              <p className="text-white/70 text-xs">
                Visualisasi bulanan tahun ini
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-charcoal rounded-full border border-white/5">
                <span className="w-2 h-2 rounded-full bg-soft-pink"></span>
                <span className="text-[10px] font-bold uppercase text-white/80">
                  Registrasi
                </span>
              </div>
            </div>
          </div>
          <div className="h-75 w-full flex items-end gap-2 px-4 relative">
            <div className="absolute inset-0 flex items-end justify-between px-4 pb-8 opacity-20">
              <div className="w-full border-b border-white/30 h-1/4"></div>
              <div className="w-full border-b border-white/30 h-2/4"></div>
              <div className="w-full border-b border-white/30 h-3/4"></div>
            </div>
            <div className="flex-1 bg-soft-pink/20 hover:bg-soft-pink/40 transition-colors rounded-t-sm h-[40%] relative group"></div>
            <div className="flex-1 bg-soft-pink/20 hover:bg-soft-pink/40 transition-colors rounded-t-sm h-[65%]"></div>
            <div className="flex-1 bg-soft-pink/20 hover:bg-soft-pink/40 transition-colors rounded-t-sm h-[55%]"></div>
            <div className="flex-1 bg-soft-pink/20 hover:bg-soft-pink/40 transition-colors rounded-t-sm h-[85%]"></div>
            <div className="flex-1 bg-soft-pink/40 rounded-t-sm h-[95%] shadow-[0_0_15px_rgba(255,143,199,0.3)] relative group">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-soft-pink text-charcoal px-2 py-1 rounded text-[10px] font-bold">
                Puncak
              </div>
            </div>
            <div className="flex-1 bg-soft-pink/20 hover:bg-soft-pink/40 transition-colors rounded-t-sm h-[75%]"></div>
            <div className="flex-1 bg-soft-pink/20 hover:bg-soft-pink/40 transition-colors rounded-t-sm h-[60%]"></div>
            <div className="flex-1 bg-soft-pink/20 hover:bg-soft-pink/40 transition-colors rounded-t-sm h-[80%]"></div>
          </div>
        </div>

        <div className="bg-dark-gray border border-white/5 rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-soft-pink/10 blur-[80px] rounded-full"></div>
          <div>
            <h3 className="font-headline text-xl font-bold">Kapasitas Venue</h3>
            <p className="text-white/70 text-xs">Rata-rata okupansi saat ini</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r="70"
                  stroke="#1C1C1E"
                  strokeWidth="12"
                ></circle>
                <circle
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r="70"
                  stroke="#FF8FC7"
                  strokeDasharray="440"
                  strokeDashoffset="110"
                  strokeLinecap="round"
                  strokeWidth="12"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-soft-pink">75%</span>
                <span className="text-[10px] font-label uppercase tracking-widest opacity-60">
                  Terisi
                </span>
              </div>
            </div>
            <div className="w-full space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Tiket Terjual</span>
                <span className="font-bold">75%</span>
              </div>
              <div className="w-full h-1 bg-charcoal rounded-full overflow-hidden">
                <div className="h-full bg-soft-pink w-[75%]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 3: My Events Grid (Dinamis - Maksimal 3) --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-2xl font-extrabold tracking-tight">
            Event Saya
          </h3>
          <Link
            to="/dashboard/events"
            className="text-soft-pink text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:underline"
          >
            Lihat Semua
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
                  (acc, curr) => acc + curr.available_seats,
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
                  className="bg-dark-gray rounded-xl overflow-hidden group border border-white/5 flex flex-col"
                >
                  <div className="h-48 relative overflow-hidden shrink-0">
                    <img
                      className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 ${isSoldOut ? "grayscale" : ""}`}
                      alt={event.title}
                      src={imageSrc}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-gray via-transparent to-transparent"></div>
                    <div
                      className={`absolute top-4 left-4 ${isSoldOut ? "bg-red-500/90 text-white" : "bg-green-500/90 text-white"} text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md`}
                    >
                      {isSoldOut ? "Sold Out" : "On Sale"}
                    </div>
                  </div>
                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <h4 className="text-lg font-bold group-hover:text-soft-pink transition-colors leading-tight line-clamp-2">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-4 text-white/70 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          calendar_today
                        </span>
                        <span>{formatDate(event.event_date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          location_on
                        </span>
                        <span className="truncate max-w-30">
                          {event.location}
                        </span>
                      </div>
                    </div>
                    <div className="pt-4 mt-auto border-t border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-white/70 font-label uppercase tracking-widest">
                          Kapasitas
                        </p>
                        <p
                          className={`text-sm font-bold ${isSoldOut ? "text-red-400" : "text-white"}`}
                        >
                          {totalCapacity} Kursi
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/70 font-label uppercase tracking-widest text-right">
                          Tipe Tiket
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

      {/* --- Section 4: Recent Transactions (Statis) --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-2xl font-extrabold tracking-tight">
            Transaksi Terbaru
          </h3>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-dark-gray border border-white/5 rounded-lg text-xs font-bold hover:bg-charcoal transition-all hidden sm:flex">
              <span className="material-symbols-outlined text-sm">
                download
              </span>{" "}
              Export PDF
            </button>
          </div>
        </div>
        <div className="bg-dark-gray border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-charcoal border-b border-white/10">
                  <th className="px-8 py-5 text-[10px] font-label uppercase tracking-widest text-white/70 whitespace-nowrap">
                    Pembeli
                  </th>
                  <th className="px-8 py-5 text-[10px] font-label uppercase tracking-widest text-white/70 whitespace-nowrap">
                    Event
                  </th>
                  <th className="px-8 py-5 text-[10px] font-label uppercase tracking-widest text-white/70 text-center whitespace-nowrap">
                    Tiket
                  </th>
                  <th className="px-8 py-5 text-[10px] font-label uppercase tracking-widest text-white/70 whitespace-nowrap">
                    Jumlah
                  </th>
                  <th className="px-8 py-5 text-[10px] font-label uppercase tracking-widest text-white/70 whitespace-nowrap">
                    Tanggal
                  </th>
                  <th className="px-8 py-5 text-[10px] font-label uppercase tracking-widest text-white/70 text-right whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr className="hover:bg-charcoal transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-charcoal border border-white/5 flex items-center justify-center text-[10px] font-bold text-soft-pink">
                        AW
                      </div>
                      <div>
                        <p className="text-sm font-bold whitespace-nowrap">
                          Adi Wijaya
                        </p>
                        <p className="text-[10px] text-white/70">
                          adi.w@mail.com
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium whitespace-nowrap">
                    Event Pertama Anda (Contoh)
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="px-2 py-1 bg-soft-pink/10 text-soft-pink text-[10px] font-bold rounded border border-soft-pink/20 whitespace-nowrap">
                      1x VIP
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-black whitespace-nowrap">
                    Rp 1,500,000
                  </td>
                  <td className="px-8 py-5 text-sm text-white/70 whitespace-nowrap">
                    2 Menit yang lalu
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-[10px] font-black uppercase text-green-400">
                      Berhasil
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-dark-gray flex justify-center border-t border-white/5">
            <Link
              to="/dashboard/transactions"
              className="px-8 py-2 text-xs font-bold uppercase tracking-widest border border-white/20 rounded-lg hover:bg-charcoal hover:border-white/40 transition-all"
            >
              Lihat Semua Transaksi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
