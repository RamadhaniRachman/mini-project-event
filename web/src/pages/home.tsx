import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cek Session User
    const userString = localStorage.getItem("user");
    if (userString) {
      const userData = JSON.parse(userString);
      const userRole = String(userData.role || "").toLowerCase();

      // Kembalikan Organizer ke habitatnya
      if (userRole === "organizer") {
        window.location.href = "/dashboard";
        return;
      }
      setUser(userData);
    }

    // Ambil Data Event Publik
    const fetchPublicEvents = async () => {
      try {
        const API_URL = import.meta.env.VITE_PROJECT_API;

        const response = await fetch(`${API_URL}/api/events/public`);
        if (response.ok) {
          const result = await response.json();
          setEvents(result.data || []);
        }
      } catch (error) {
        console.error("Gagal mengambil event publik:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicEvents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Helper: Format Tanggal (Misal: 24 MEI 2026)
  const formatEventDate = (dateString: string) => {
    if (!dateString) return "-";
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return new Date(dateString)
      .toLocaleDateString("id-ID", options)
      .toUpperCase();
  };

  // Helper: Cari Harga Tiket Termurah
  const getLowestPrice = (tickets: any[]) => {
    if (!tickets || tickets.length === 0) return "Habis";
    const lowest = Math.min(...tickets.map((t) => t.price));
    return lowest === 0 ? "Gratis" : `Rp ${lowest.toLocaleString("id-ID")}`;
  };

  return (
    <div className="dark bg-charcoal font-body text-white min-h-screen selection:bg-soft-pink selection:text-charcoal pb-24 md:pb-0">
      {/* TopAppBar */}
      <header className="fixed top-0 z-50 w-full bg-charcoal/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(0,0,0,0.4)] border-b border-white/5">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-black italic text-soft-pink font-headline tracking-tighter uppercase">
            NEON STAGE
          </div>
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                search
              </span>
              <input
                className="w-full bg-dark-gray border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-soft-pink/40 placeholder:text-white/40 outline-none transition-all"
                placeholder="Cari artis, event, atau lokasi..."
                type="text"
              />
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a
              className="text-soft-pink font-bold font-headline tracking-tighter uppercase hover:text-light-pink transition-colors scale-95 active:scale-90 duration-200"
              href="#"
            >
              Discover
            </a>
            <a
              className="text-white/80 font-headline tracking-tighter uppercase hover:text-soft-pink transition-colors scale-95 active:scale-90 duration-200"
              href="#"
            >
              Schedule
            </a>
            <div className="flex items-center gap-4 ml-4">
              <span className="material-symbols-outlined text-soft-pink cursor-pointer hover:text-light-pink transition-colors hidden sm:block">
                favorite
              </span>
              <span className="material-symbols-outlined text-soft-pink cursor-pointer hover:text-light-pink transition-colors hidden sm:block">
                notifications
              </span>

              {/* User Profile / Login Button */}
              {user ? (
                <div className="group relative">
                  <div className="w-8 h-8 rounded-full bg-dark-gray border border-soft-pink/30 flex items-center justify-center cursor-pointer hover:border-soft-pink transition-colors overflow-hidden">
                    <span className="font-bold text-soft-pink text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute right-0 mt-2 w-32 bg-dark-gray border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-charcoal rounded-lg font-medium"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <a
                  href="/login"
                  className="material-symbols-outlined text-soft-pink cursor-pointer hover:text-light-pink transition-colors"
                >
                  account_circle
                </a>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-20 max-w-7xl mx-auto px-6">
        {/* Featured Hero (Dibiarkan Static karena desainnya spesifik dan cantik) */}
        <section className="mb-12">
          <div className="relative w-full h-[450px] md:h-[550px] rounded-2xl overflow-hidden group border border-white/5 shadow-2xl shadow-black/40">
            <img
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
              alt="Born Pink Encore"
              src="https://images.unsplash.com/photo-1540039155732-684735035727?auto=format&fit=crop&q=80&w=2000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-soft-pink text-charcoal text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                  HIGHLIGHT
                </span>
                <span className="text-light-pink text-xs font-medium">
                  World Tour 2026
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter mb-4 italic uppercase text-white">
                BLACKPINK <br />{" "}
                <span className="text-soft-pink">BORN PINK</span> ENCORE
              </h1>
              <p className="text-white/70 text-lg mb-8 max-w-lg line-clamp-2">
                The global phenomenon returns for a final historic night.
                Witness the magic one last time at the Jakarta International
                Stadium.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button className="stage-gradient text-charcoal font-bold px-8 py-3 rounded-lg shadow-[0_0_20px_rgba(255,143,199,0.4)] hover:scale-105 transition-transform active:scale-95">
                  Beli Tiket Sekarang
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter Bar */}
        <section className="mb-10 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 whitespace-nowrap py-2">
            <button className="stage-gradient text-charcoal px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
              Semua Event
            </button>
            {[
              "Konser Musik",
              "Festival Budaya",
              "Workshop Seni",
              "Fan Meeting",
            ].map((cat) => (
              <button
                key={cat}
                className="bg-dark-gray border border-white/10 hover:border-soft-pink/40 hover:text-white text-white/60 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all"
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Event Grid Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-headline font-extrabold italic uppercase tracking-tighter text-white">
              Populer <span className="text-soft-pink">Minggu Ini</span>
            </h2>
            <div className="h-1 w-20 bg-soft-pink mt-2 rounded-full"></div>
          </div>
          <a
            className="text-light-pink text-sm font-bold uppercase tracking-widest hover:text-soft-pink transition-colors hidden sm:block"
            href="#"
          >
            Lihat Semua
          </a>
        </div>

        {/* 🔴 EVENT GRID DINAMIS DARI DATABASE 🔴 */}
        {isLoading ? (
          <div className="flex justify-center items-center h-48 text-soft-pink font-headline font-bold tracking-widest animate-pulse">
            MEMUAT STAGE...
          </div>
        ) : events.length === 0 ? (
          <div className="w-full bg-dark-gray border border-white/5 rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
            <span className="material-symbols-outlined text-6xl text-white/20">
              event_busy
            </span>
            <div className="space-y-1">
              <p className="text-white font-bold text-lg">
                Belum Ada Event Aktif
              </p>
              <p className="text-white/40 text-sm">
                Saat ini belum ada event yang dipublikasikan oleh Organizer.
              </p>
            </div>
          </div>
        ) : (
          <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {events.map((event) => {
              // Siapkan Link Gambar (Bisa dari backend langsung atau cloudinary)
              const imageSrc = event.image_url
                ? event.image_url.startsWith("http")
                  ? event.image_url
                  : `http://localhost:8000${event.image_url}`
                : "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400"; // Fallback image

              return (
                <Link
                  to={`/events/${event.id}`}
                  key={event.id}
                  className="group bg-dark-gray rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 border border-white/5 hover:shadow-xl hover:shadow-black/60 flex flex-col"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80"
                      alt={event.title}
                      src={imageSrc}
                    />
                    <div className="absolute top-3 right-3 bg-charcoal/80 backdrop-blur-md p-1.5 rounded-full text-soft-pink hover:text-light-pink transition-colors z-10">
                      <span className="material-symbols-outlined text-sm">
                        favorite
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-dark-gray to-transparent z-10">
                      <span className="text-[10px] font-bold text-soft-pink uppercase tracking-widest truncate block">
                        {event.category || "EVENT UMUM"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-white leading-tight mb-2 group-hover:text-soft-pink transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="space-y-1 mb-4 mt-auto">
                      <div className="flex items-center gap-2 text-white/60 text-[11px]">
                        <span className="material-symbols-outlined text-xs">
                          calendar_today
                        </span>
                        <span>{formatEventDate(event.event_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60 text-[11px]">
                        <span className="material-symbols-outlined text-xs">
                          location_on
                        </span>
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-white/10 mt-auto">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">
                        Mulai dari
                      </p>
                      <p className="text-soft-pink font-black text-lg">
                        {getLowestPrice(event.tickets)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
