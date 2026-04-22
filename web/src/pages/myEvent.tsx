import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// 1. Definisikan bentuk data dari Backend
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
  category: string;
  is_free: boolean;
  image_url: string | null;
  tickets: Ticket[];
}

export default function MyEvents() {
  const API_URL = import.meta.env.VITE_PROJECT_API;

  const [activeFilter, setActiveFilter] = useState("Semua");
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Fungsi untuk mengambil data dari Backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/events/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          // API Anda sebelumnya mengembalikan { status: "success", data: [...] }
          setEvents(data.data || []);
        }
      } catch (error) {
        console.error("Gagal mengambil data event:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 3. Helper untuk format tanggal menjadi "24 Oct 2026"
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-24 md:pb-12">
      {/* --- Hero Header Section --- */}
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white mb-2 font-headline">
            Acara Saya
          </h1>
          <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
            Kelola dan pantau seluruh pertunjukan panggung Anda dalam satu
            tempat.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-6 py-3 rounded-xl border border-soft-pink/30 text-soft-pink font-bold hover:bg-soft-pink/10 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">download</span>
            <span>Laporan Penjualan</span>
          </button>
          <Link
            to="/dashboard/create-event"
            className="px-8 py-3 rounded-xl stage-gradient text-charcoal font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-soft-pink/10 active:scale-95 transition-all"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add
            </span>
            <span>Buat Event Baru</span>
          </Link>
        </div>
      </section>

      {/* --- Filters & Search Toolbar --- */}
      <section className="mb-10 flex flex-wrap items-center justify-between gap-6 bg-dark-gray p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto">
          {["Semua", "Aktif", "Selesai", "Draft"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                activeFilter === filter
                  ? "bg-soft-pink text-charcoal"
                  : "hover:bg-charcoal text-white/60 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
          <button className="flex items-center gap-2 text-white/60 hover:text-soft-pink transition-colors text-sm font-medium">
            <span className="material-symbols-outlined text-xl">
              filter_list
            </span>
            <span>Urutkan: Terbaru</span>
          </button>
        </div>
      </section>

      {/* --- Events Grid (Dinamis dari Database) --- */}
      {isLoading ? (
        <div className="py-20 text-center text-soft-pink font-bold animate-pulse">
          MEMUAT DATA EVENT...
        </div>
      ) : events.length === 0 ? (
        <div className="py-20 text-center text-white/40 border border-white/5 border-dashed rounded-2xl">
          Belum ada event yang dibuat. Ayo buat event pertamamu!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => {
            // Kalkulasi kapasitas (total kursi yang tersedia)
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

            // Jika ini adalah event pertama di array (index 0), pakai desain BESAR (Highlight)
            if (index === 0) {
              return (
                <div
                  key={event.id}
                  className="lg:col-span-2 group relative overflow-hidden rounded-2xl bg-dark-gray border border-white/5 flex flex-col md:flex-row transition-all hover:shadow-2xl hover:shadow-black/60"
                >
                  <div className="md:w-1/2 h-64 md:h-full relative overflow-hidden">
                    <img
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                      alt={event.title}
                      src={imageSrc}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-gray via-transparent to-transparent md:bg-gradient-to-r md:from-dark-gray"></div>
                    <div
                      className={`absolute top-4 left-4 ${isSoldOut ? "bg-red-500/90" : "bg-soft-pink text-charcoal"} px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase`}
                    >
                      {isSoldOut ? "SOLD OUT" : event.category || "Highlight"}
                    </div>
                  </div>
                  <div className="md:w-1/2 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-soft-pink mb-2">
                        <span className="material-symbols-outlined text-sm">
                          calendar_today
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest">
                          {formatDate(event.event_date)}
                        </span>
                      </div>
                      <h3 className="text-3xl font-headline font-bold tracking-tight mb-4 group-hover:text-soft-pink transition-colors">
                        {event.title}
                      </h3>
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-white/80">
                          <span className="material-symbols-outlined text-soft-pink">
                            location_on
                          </span>
                          <span className="text-sm">{event.location}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-wide">
                            <span className="text-white/40">
                              Status Kapasitas
                            </span>
                            <span
                              className={
                                isSoldOut ? "text-red-400" : "text-soft-pink"
                              }
                            >
                              {isSoldOut
                                ? "Penuh"
                                : `${totalCapacity} Tersedia`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-charcoal rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isSoldOut ? "bg-red-500" : "stage-gradient"}`}
                              style={{ width: isSoldOut ? "100%" : "30%" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/dashboard/events/edit/${event.id}`}
                      className="w-full py-4 bg-charcoal hover:bg-white/5 rounded-xl text-white font-bold transition-all border border-white/10 active:scale-95 text-center block"
                    >
                      Kelola Event
                    </Link>
                  </div>
                </div>
              );
            }

            // Untuk event sisanya (index > 0), pakai desain KARTU KECIL
            return (
              <div
                key={event.id}
                className="group relative overflow-hidden rounded-2xl bg-dark-gray border border-white/5 flex flex-col transition-all hover:shadow-2xl hover:shadow-black/60"
              >
                <div className="h-48 relative overflow-hidden">
                  <img
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 ${isSoldOut ? "grayscale" : ""}`}
                    alt={event.title}
                    src={imageSrc}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-gray via-transparent to-transparent"></div>
                  <div
                    className={`absolute top-4 ${isSoldOut ? "left-4 bg-red-500/90 text-white" : "right-4 bg-charcoal/80 text-white/60 border border-white/10"} px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md`}
                  >
                    {isSoldOut ? "SOLD OUT" : "AKTIF"}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-white/40 mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {formatDate(event.event_date)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight mb-4 group-hover:text-soft-pink transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-3 text-white/60 mb-6">
                    <span className="material-symbols-outlined text-sm">
                      location_on
                    </span>
                    <span className="text-xs truncate">{event.location}</span>
                  </div>
                  <div className="mt-auto space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase text-soft-pink">
                        <span>Kursi</span>
                        <span>{totalCapacity} Sisa</span>
                      </div>
                      <div className="w-full h-1 bg-charcoal rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isSoldOut ? "bg-red-500" : "bg-soft-pink"}`}
                          style={{ width: isSoldOut ? "100%" : "60%" }}
                        ></div>
                      </div>
                    </div>
                    <Link
                      to={`/dashboard/events/edit/${event.id}`}
                      className="w-full py-3 bg-charcoal hover:bg-white/5 rounded-lg text-white font-bold text-sm transition-all border border-white/10 text-center block"
                    >
                      Kelola Event
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- Pagination --- */}
      <section className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-white/40 text-sm font-medium text-center md:text-left">
          Menampilkan <span className="text-white">{events.length}</span> event
          dari database.
        </p>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-dark-gray text-white/40 hover:text-soft-pink transition-all border border-white/5">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-soft-pink text-charcoal font-bold">
            1
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-dark-gray text-white/40 hover:text-soft-pink transition-all border border-white/5">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </section>
    </div>
  );
}
