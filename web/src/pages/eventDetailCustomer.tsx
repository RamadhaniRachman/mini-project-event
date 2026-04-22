import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EventDetailCustomer() {
  const { id } = useParams(); // Tangkap ID event dari URL
  const navigate = useNavigate();

  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("deskripsi");

  useEffect(() => {
    // 1. Cek User Session
    const userString = localStorage.getItem("user");
    if (userString) {
      const userData = JSON.parse(userString);
      const userRole = String(userData.role || "").toLowerCase();

      if (userRole === "organizer") {
        navigate("/dashboard");
        return;
      }
      setUser(userData);
    }

    // 2. Fetch Detail Event Publik
    const fetchEventDetail = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/events/${id}`);
        if (response.ok) {
          const data = await response.json();
          setEventData(data);
        } else {
          console.error("Event tidak ditemukan");
        }
      } catch (error) {
        console.error("Gagal mengambil data event:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchEventDetail();
  }, [id, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // --- Helper Functions ---
  const formatLongDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getLowestPrice = (tickets: any[]) => {
    if (!tickets || tickets.length === 0) return "Habis";
    const lowest = Math.min(...tickets.map((t) => t.price));
    return lowest === 0 ? "Gratis" : `Rp ${lowest.toLocaleString("id-ID")}`;
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal flex justify-center items-center text-soft-pink font-headline font-bold text-3xl tracking-widest animate-pulse">
        MEMBUKA PANGGUNG...
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-charcoal flex justify-center items-center text-white font-headline">
        <h1 className="text-4xl font-bold">Event Tidak Ditemukan</h1>
      </div>
    );
  }

  const imageSrc = eventData.image_url
    ? eventData.image_url.startsWith("http")
      ? eventData.image_url
      : `http://localhost:8000${eventData.image_url}`
    : "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=2000";

  return (
    <div className="dark bg-charcoal font-body text-white min-h-screen selection:bg-soft-pink selection:text-charcoal">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-charcoal/80 backdrop-blur-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b border-white/5">
        <div className="flex justify-between items-center px-6 md:px-8 h-20 max-w-screen-2xl mx-auto">
          <a
            href="/"
            className="text-2xl font-black text-soft-pink tracking-tighter uppercase italic font-headline"
          >
            NEON STAGE
          </a>
          <nav className="hidden md:flex items-center gap-8 font-headline tracking-tight font-bold">
            <a
              className="text-white/70 hover:text-soft-pink transition-all duration-300"
              href="/"
            >
              Discover
            </a>
            <a
              className="text-white/70 hover:text-soft-pink transition-all duration-300"
              href="#"
            >
              Tours
            </a>
            <a
              className="text-white/70 hover:text-soft-pink transition-all duration-300"
              href="#"
            >
              Venues
            </a>
          </nav>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-white/70 hidden sm:flex">
              <span className="material-symbols-outlined cursor-pointer hover:text-soft-pink transition-colors">
                favorite
              </span>
              <span className="material-symbols-outlined cursor-pointer hover:text-soft-pink transition-colors">
                shopping_bag
              </span>
            </div>

            {user ? (
              <div className="group relative">
                <div className="w-10 h-10 rounded-full bg-dark-gray border border-soft-pink/30 flex items-center justify-center cursor-pointer hover:border-soft-pink transition-colors overflow-hidden">
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
            ) : (
              <a
                href="/login"
                className="bg-soft-pink text-charcoal px-6 py-2.5 rounded-lg font-bold hover:brightness-110 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,143,199,0.3)]"
              >
                Login
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Header */}
        <section className="relative w-full h-[614px] min-h-[500px] overflow-hidden border-b border-white/5">
          <div className="absolute inset-0">
            <img
              className="w-full h-full object-cover opacity-80"
              alt={eventData.title}
              src={imageSrc}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/60 to-transparent opacity-80"></div>
          </div>
          <div className="relative h-full max-w-screen-2xl mx-auto px-6 md:px-8 flex flex-col justify-end pb-12">
            <div className="flex flex-col gap-4 max-w-4xl">
              <span className="inline-block px-3 py-1 bg-soft-pink/10 border border-soft-pink/30 text-soft-pink text-xs font-bold tracking-widest uppercase rounded-full w-fit">
                {eventData.category || "Konser Umum"}
              </span>
              <h1 className="text-5xl md:text-8xl font-black font-headline tracking-tighter text-white uppercase italic leading-none text-shadow-lg drop-shadow-2xl">
                {eventData.title}
              </h1>
              <div className="flex flex-wrap gap-6 mt-4 text-white/80 font-medium">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-soft-pink">
                    calendar_today
                  </span>
                  <span>{formatLongDate(eventData.event_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-soft-pink">
                    location_on
                  </span>
                  <span>{eventData.location}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="max-w-screen-2xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12 pb-20">
          {/* Left Column: Tabs & Info */}
          <div className="lg:col-span-8 space-y-12">
            {/* Tabs */}
            <div className="flex gap-8 border-b border-white/10 font-headline font-bold text-lg overflow-x-auto no-scrollbar whitespace-nowrap">
              <button
                onClick={() => setActiveTab("deskripsi")}
                className={`pb-4 transition-all border-b-2 ${activeTab === "deskripsi" ? "text-soft-pink border-soft-pink" : "text-white/40 border-transparent hover:text-white"}`}
              >
                Deskripsi
              </button>
              <button
                onClick={() => setActiveTab("tiket")}
                className={`pb-4 transition-all border-b-2 ${activeTab === "tiket" ? "text-soft-pink border-soft-pink" : "text-white/40 border-transparent hover:text-white"}`}
              >
                Tiket
              </button>
              <button
                onClick={() => setActiveTab("snk")}
                className={`pb-4 transition-all border-b-2 ${activeTab === "snk" ? "text-soft-pink border-soft-pink" : "text-white/40 border-transparent hover:text-white"}`}
              >
                Syarat & Ketentuan
              </button>
            </div>

            {/* Description Section */}
            <article
              className={`space-y-6 ${activeTab === "deskripsi" ? "block" : "hidden"}`}
            >
              <h2 className="text-3xl font-black font-headline tracking-tight uppercase text-white">
                Tentang Event
              </h2>
              <div className="space-y-4 text-white/70 leading-relaxed text-lg max-w-4xl whitespace-pre-wrap">
                {eventData.description ||
                  "Penyelenggara belum menambahkan deskripsi untuk event ini."}
              </div>
            </article>

            {/* Syarat & Ketentuan Section */}
            <article
              className={`space-y-6 ${activeTab === "snk" ? "block" : "hidden"}`}
            >
              <h2 className="text-3xl font-black font-headline tracking-tight uppercase text-white">
                Syarat & Ketentuan
              </h2>
              <ul className="list-disc pl-5 space-y-3 text-white/70 text-lg">
                <li>
                  Tiket yang sudah dibeli tidak dapat dikembalikan
                  (Non-refundable).
                </li>
                <li>
                  Wajib membawa kartu identitas (KTP/SIM/Paspor) asli yang
                  sesuai dengan nama pembeli tiket.
                </li>
                <li>
                  Dilarang membawa senjata tajam, obat-obatan terlarang, dan
                  kamera profesional.
                </li>
                <li>
                  Penyelenggara berhak menolak masuk pengunjung yang melanggar
                  aturan.
                </li>
              </ul>
            </article>

            {/* Ticket Section (Tab 'tiket' atau selalu tampil di bawah deskripsi) */}
            <div
              id="tickets"
              className={`space-y-8 pt-8 border-t border-white/5 ${activeTab === "tiket" || activeTab === "deskripsi" ? "block" : "hidden"}`}
            >
              <h2 className="text-3xl font-black font-headline tracking-tight uppercase text-white">
                Pilihan Tiket
              </h2>

              <div className="grid gap-6">
                {eventData.tickets && eventData.tickets.length > 0 ? (
                  eventData.tickets.map((ticket: any) => {
                    const isSoldOut = ticket.available_seats <= 0;

                    return (
                      <div
                        key={ticket.id}
                        className={`border rounded-xl overflow-hidden group shadow-lg transition-all duration-300 ${isSoldOut ? "bg-dark-gray/50 border-white/5 opacity-60 cursor-not-allowed" : "bg-dark-gray border-white/5 hover:border-soft-pink/30 hover:bg-charcoal"}`}
                      >
                        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              {isSoldOut ? (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded border border-red-500/20">
                                  Habis
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-soft-pink/20 text-soft-pink text-[10px] font-bold uppercase tracking-widest rounded border border-soft-pink/20">
                                  Tersedia
                                </span>
                              )}
                              <h3
                                className={`text-xl font-bold font-headline ${isSoldOut ? "text-white/60" : "text-white"}`}
                              >
                                {ticket.name}
                              </h3>
                            </div>
                            <p className="text-white/60 text-sm flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm text-soft-pink">
                                info
                              </span>
                              Sisa kursi: {ticket.available_seats} pax
                            </p>
                          </div>
                          <div className="flex flex-col md:items-end gap-3">
                            <p
                              className={`text-2xl font-black font-headline ${isSoldOut ? "text-white/40 line-through" : "text-soft-pink"}`}
                            >
                              Rp {ticket.price.toLocaleString("id-ID")}
                            </p>
                            {isSoldOut ? (
                              <span className="text-red-400 font-black uppercase tracking-tighter italic">
                                TERJUAL HABIS
                              </span>
                            ) : (
                              <button className="px-8 py-2.5 border-2 border-soft-pink/50 text-soft-pink font-bold rounded-lg hover:bg-soft-pink hover:text-charcoal transition-all active:scale-95 shadow-[0_0_10px_rgba(255,143,199,0.1)]">
                                Pilih Tiket
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-white/40 italic">
                    Penyelenggara belum menambahkan tiket untuk event ini.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Purchase Panel */}
          <aside className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-dark-gray border border-white/5 rounded-2xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                <div className="mb-6 border-b border-white/10 pb-6">
                  <p className="text-white/60 text-sm font-medium mb-1 uppercase tracking-widest">
                    Harga Mulai Dari
                  </p>
                  <h3 className="text-4xl font-black font-headline text-soft-pink">
                    {getLowestPrice(eventData.tickets)}
                  </h3>
                </div>
                <div className="space-y-5 mb-8">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-soft-pink">
                      event
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {formatLongDate(eventData.event_date)}
                      </p>
                      <p className="text-xs text-white/60 mt-0.5">
                        Waktu Mulai:{" "}
                        {eventData.event_time?.substring(0, 5) || "TBA"} WIB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-soft-pink">
                      location_on
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white line-clamp-2">
                        {eventData.location}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/checkout/${id}`)}
                  className="w-full py-4 stage-gradient text-charcoal font-black text-xl uppercase italic tracking-tighter rounded-xl active:scale-95 transition-all shadow-[0_0_20px_rgba(255,143,199,0.3)] hover:brightness-110"
                >
                  Beli Tiket
                </button>
                <div className="mt-6 flex justify-center gap-4">
                  <button className="p-3 bg-charcoal border border-white/5 hover:border-soft-pink/50 rounded-lg text-white/60 hover:text-soft-pink transition-colors">
                    <span className="material-symbols-outlined">share</span>
                  </button>
                  <button className="p-3 bg-charcoal border border-white/5 hover:border-soft-pink/50 rounded-lg text-white/60 hover:text-soft-pink transition-colors">
                    <span className="material-symbols-outlined">favorite</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* Footer */}
        <footer className="w-full py-16 mt-20 bg-charcoal border-t border-white/5 px-6 md:px-12">
          {/* ... (Footer sama persis dengan desain Anda) ... */}
          <div className="flex flex-col md:flex-row justify-between items-center max-w-screen-2xl mx-auto gap-8">
            <div className="text-soft-pink font-black text-xl font-headline tracking-tighter italic uppercase">
              NEON STAGE
            </div>
            <p className="text-white/40 font-body text-sm text-center md:text-right">
              © 2026 NEON STAGE. THE ULTIMATE EXPERIENCE.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
