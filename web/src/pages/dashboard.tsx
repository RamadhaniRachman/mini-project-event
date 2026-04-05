import React, { useEffect, useState } from "react";

// --- 1. DEFINISI TIPE DATA TYPESCRIPT ---
interface User {
  name: string;
  email: string;
  role: string;
}

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

export default function Dashboard() {
  // 2. STATE MANAGEMENT
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
  });
  const [events, setEvents] = useState<EventData[]>([]);
  // State untuk create event
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk form input event
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    event_date: "",
    event_time: "",
    is_free: false,
  });

  // State khusus tiket (sementara kita buat default 1 tipe tiket dulu)
  const [ticketForm, setTicketForm] = useState({
    name: "Reguler",
    price: 0,
    available_seats: 0,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fungsi untuk me-refresh data setelah event baru berhasil dibuat
  const refreshData = async () => {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    try {
      const [statsRes, eventsRes] = await Promise.all([
        fetch("http://localhost:8000/api/events/stats", { headers }),
        fetch("http://localhost:8000/api/events/list", { headers }),
      ]);
      if (statsRes.ok && eventsRes.ok) {
        const statsData = await statsRes.json();
        const eventsData = await eventsRes.json();
        setStats(statsData.stats);
        setEvents(eventsData.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  // 3. FORMATTER
  const formatRupiah = (angka: number) => {
    // Memperpendek angka jutaan (contoh: 4.500.000 -> 4.5M) agar pas di UI
    if (angka >= 1000000) return `Rp ${(angka / 1000000).toFixed(1)}M`;
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

  // 4. USE EFFECT (PENGAMBILAN DATA)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userString = localStorage.getItem("user");

        if (!token || !userString) {
          window.location.href = "/login";
          return;
        }

        const userData = JSON.parse(userString);
        const userRole = String(userData.role || "").toLowerCase();

        if (userRole !== "organizer") {
          window.location.href = "/";
          return;
        }

        setUser(userData);

        // Fetching Data dari API secara bersamaan
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [statsRes, eventsRes] = await Promise.all([
          fetch("http://localhost:8000/api/events/stats", { headers }),
          fetch("http://localhost:8000/api/events/list", { headers }),
        ]);

        if (statsRes.ok && eventsRes.ok) {
          const statsData = await statsRes.json();
          const eventsData = await eventsRes.json();

          setStats(statsData.stats);
          setEvents(eventsData.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-charcoal flex justify-center items-center text-soft-pink font-headline font-bold text-xl tracking-widest animate-pulse">
        MEMUAT STAGE...
      </div>
    );
  }
  // 5. FUNGSI
  // Submit event baru
  const handleCreateEvent = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      // Gabungkan tanggal dan waktu agar sesuai format ISO Prisma
      const combinedDateTime = new Date(
        `${eventForm.event_date}T${eventForm.event_time}:00`,
      ).toISOString();
      const isoDate = new Date(eventForm.event_date).toISOString();

      // FormData
      const formData = new FormData();

      // Memasukkan semua data teks ke dalam FormData
      formData.append("title", eventForm.title);
      formData.append("description", eventForm.description);
      formData.append("location", eventForm.location);
      formData.append("category", eventForm.category);
      formData.append("event_date", isoDate);
      formData.append("event_time", combinedDateTime);
      formData.append("is_free", String(eventForm.is_free));

      // Stringify tiket karena backend (multer) membaca semuanya sebagai string
      const ticketData = [
        {
          name: ticketForm.name,
          price: Number(ticketForm.price),
          available_seats: Number(ticketForm.available_seats),
        },
      ];
      formData.append("tickets", JSON.stringify(ticketData));

      // Masukkan file gambar jika user memilihnya
      if (imageFile) {
        // Nama 'image' ini harus sama persis dengan upload.single('image') di backend
        formData.append("image", imageFile);
      }

      //Kirim fetch request
      const response = await fetch("http://localhost:8000/api/events/create", {
        method: "POST",
        headers: {
          // JANGAN tulis "Content-Type": "multipart/form-data" di sini.
          // Browser akan otomatis menambahkannya beserta kode "boundary" acak.
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Event berhasil dibuat! 🚀");
        setIsModalOpen(false); // Tutup modal
        refreshData(); // Panggil ulang API agar Dashboard ter-update

        // Kosongkan form kembali
        setEventForm({
          title: "",
          description: "",
          location: "",
          category: "",
          event_date: "",
          event_time: "",
          is_free: false,
        });
        setTicketForm({ name: "Reguler", price: 0, available_seats: 0 });
        setImageFile(null);
      } else {
        const errData = await response.json();
        alert(`Gagal: ${errData.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dark bg-charcoal font-body text-white min-h-screen selection:bg-soft-pink selection:text-charcoal">
      {/* SideNavBar Shell */}
      <aside className="hidden md:flex flex-col h-screen w-72 left-0 top-0 fixed bg-dark-gray py-8 space-y-6 z-50 border-r border-white/5">
        <div className="px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 stage-gradient rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-charcoal font-bold">
                theater_comedy
              </span>
            </div>
            <div>
              <h1 className="text-soft-pink font-black uppercase tracking-widest text-lg leading-none">
                BACKSTAGE
              </h1>
              <p className="text-[10px] text-white/60 tracking-wider mt-1">
                Event Control Center
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-4 stage-gradient text-charcoal font-bold rounded-xl flex items-center justify-center gap-2 mb-10 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span>Create Event</span>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {/* Menu navigasi dibiarkan statis sesuai desain awal */}
          <a
            className="flex items-center gap-4 px-4 py-3.5 text-soft-pink bg-soft-pink/10 border-r-4 border-soft-pink font-semibold transition-all"
            href="#"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label uppercase tracking-widest text-xs">
              Dashboard
            </span>
          </a>
          <a
            className="flex items-center gap-4 px-4 py-3.5 text-white/40 font-medium hover:bg-white/5 hover:text-white transition-all rounded-lg"
            href="#"
          >
            <span className="material-symbols-outlined">event</span>
            <span className="font-label uppercase tracking-widest text-xs">
              My Events
            </span>
          </a>
          {/* ... (Menu lainnya tetap sama) */}
        </nav>

        <div className="px-4 mt-auto space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-red-400/80 font-medium hover:bg-red-500/10 hover:text-red-400 transition-all rounded-lg"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label uppercase tracking-widest text-xs">
              Logout
            </span>
          </button>
        </div>
      </aside>

      <main className="md:ml-72 min-h-screen relative">
        {/* TopAppBar Shell */}
        <header className="sticky top-0 z-40 bg-charcoal/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 w-full border-b border-white/5">
          <div className="flex items-center gap-8">
            <h2 className="font-headline text-xl font-bold tracking-tighter text-soft-pink">
              DASHBOARD EVENT
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pl-6 border-l border-white/20">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-tight capitalize">
                  {user.name}
                </p>
                <p className="text-[10px] text-soft-pink uppercase tracking-widest">
                  {user.role}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border border-soft-pink/20 bg-dark-gray flex items-center justify-center">
                <span className="font-bold text-soft-pink">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto space-y-12">
          {/* --- SECTION 1: STATS DINAMIS --- */}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Box 1: Pendapatan */}
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
                    {formatRupiah(stats.totalRevenue)}
                  </h4>
                </div>
              </div>

              {/* Box 2: Tiket */}
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
                    {stats.totalTicketsSold || 0}
                  </h4>
                </div>
              </div>

              {/* Box 3: Event Aktif */}
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
                    {stats.totalEvents}
                  </h4>
                </div>
              </div>

              {/* Box 4: Statis Dummy */}
              <div className="bg-dark-gray p-6 rounded-xl space-y-4 hover:bg-charcoal border border-white/5 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-lg bg-soft-pink/10 text-soft-pink group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">
                      person_add
                    </span>
                  </div>
                  <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">
                    +12
                  </span>
                </div>
                <div>
                  <p className="text-white/70 text-xs font-label uppercase tracking-widest">
                    Registrasi Baru
                  </p>
                  <h4 className="text-2xl font-black mt-1">128</h4>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Data Visualization (Dibiarkan Statis) */}
          {/* ... (Visualisasi Grafik dan Kapasitas Venue tetap ada di sini) ... */}

          {/* --- SECTION 3: MY EVENTS GRID DINAMIS --- */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-2xl font-extrabold tracking-tight">
                Event Saya
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {events.length === 0 ? (
                <div className="col-span-full py-12 text-center text-white/50 border border-white/5 rounded-xl border-dashed">
                  Anda belum membuat event apapun.
                </div>
              ) : (
                events.map((event, index) => {
                  // Fallback gambar cantik agar UI tetap terlihat hidup
                  const images = [
                    "https://images.unsplash.com/photo-1540039155732-684735035727?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800",
                  ];

                  // Menghitung total kapasitas kursi dari seluruh jenis tiket
                  const totalCapacity = event.tickets.reduce(
                    (acc, curr) => acc + curr.available_seats,
                    0,
                  );

                  // variabel mendeteksi sudah sold out atau belum
                  const isSoldOut = totalCapacity === 0;

                  return (
                    <div
                      key={event.id}
                      className="bg-dark-gray rounded-xl overflow-hidden group border border-white/5 flex flex-col"
                    >
                      <div className="h-48 relative overflow-hidden shrink-0">
                        <img
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                          alt="Event background"
                          src={
                            event.image_url
                              ? `http://localhost:8000${event.image_url}` // Jika ada di DB, tempelkan alamat Backend
                              : "https://images.unsplash.com/photo-1540039155732-684735035727..." // Gambar Fallback (Unsplash)
                          }
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-gray via-transparent to-transparent"></div>
                        <div
                          className={`absolute top-4 left-4 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md ${isSoldOut ? "bg-red-500/90" : "bg-green-500/90"}`}
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
                            <span className="truncate max-w-[120px]">
                              {event.location}
                            </span>
                          </div>
                        </div>
                        <div className="pt-4 mt-auto border-t border-white/10 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-white/70 font-label uppercase tracking-widest">
                              Kapasitas
                            </p>
                            <p className="text-sm font-bold">
                              {totalCapacity} Kursi
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/70 font-label uppercase tracking-widest text-right">
                              Tipe Tiket
                            </p>
                            <p className="text-sm font-bold text-soft-pink text-right">
                              {event.tickets.length} Varian
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>
      {/* --- MODAL CREATE EVENT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/80 backdrop-blur-sm p-4">
          <div className="bg-dark-gray border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-charcoal">
              <h2 className="text-xl font-bold font-headline text-soft-pink">
                Buat Event Baru
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              onSubmit={handleCreateEvent}
              className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              {/* Form Input Event */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/60 font-label uppercase tracking-widest">
                    Judul Event
                  </label>
                  <input
                    required
                    type="text"
                    value={eventForm.title}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, title: e.target.value })
                    }
                    className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-soft-pink focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/60 font-label uppercase tracking-widest">
                    Kategori
                  </label>
                  <select
                    value={eventForm.category}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, category: e.target.value })
                    }
                    className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-soft-pink focus:outline-none"
                  >
                    <option value="">Pilih...</option>
                    <option value="Konser Musik">Konser Musik</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Festival">Festival</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-white/60 font-label uppercase tracking-widest">
                    Lokasi
                  </label>
                  <input
                    required
                    type="text"
                    value={eventForm.location}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, location: e.target.value })
                    }
                    className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-soft-pink focus:outline-none"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-white/60 font-label uppercase tracking-widest">
                    Deskripsi
                  </label>
                  <textarea
                    required
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-soft-pink focus:outline-none h-20"
                  />
                </div>
                {/* --- TAMBAHKAN KOLOM UPLOAD GAMBAR INI --- */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-white/60 font-label uppercase tracking-widest">
                    Poster Event (Opsional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                    className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-soft-pink file:text-charcoal hover:file:bg-soft-pink/80 cursor-pointer text-sm"
                  />
                  {imageFile && (
                    <p className="text-xs text-green-400 mt-1">
                      File terpilih: {imageFile.name}
                    </p>
                  )}
                </div>
                {/* ----------------------------------------- */}
                <div className="space-y-1">
                  <label className="text-xs text-white/60 font-label uppercase tracking-widest">
                    Tanggal
                  </label>
                  <input
                    required
                    type="date"
                    value={eventForm.event_date}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, event_date: e.target.value })
                    }
                    className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-soft-pink focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/60 font-label uppercase tracking-widest">
                    Waktu (Jam)
                  </label>
                  <input
                    required
                    type="time"
                    value={eventForm.event_time}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, event_time: e.target.value })
                    }
                    className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-soft-pink focus:outline-none"
                  />
                </div>
              </div>

              <div className="my-6 border-b border-white/10"></div>

              {/* Form Input Tiket */}
              <h3 className="text-sm font-bold text-soft-pink mb-2 uppercase tracking-widest">
                Pengaturan Tiket
              </h3>
              <div className="bg-charcoal p-4 rounded-xl border border-white/5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-white/60 font-label">
                      Nama Tiket
                    </label>
                    <input
                      required
                      type="text"
                      value={ticketForm.name}
                      onChange={(e) =>
                        setTicketForm({ ...ticketForm, name: e.target.value })
                      }
                      className="w-full bg-dark-gray border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-soft-pink focus:outline-none"
                      placeholder="Misal: VIP"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-white/60 font-label">
                      Harga (Rp)
                    </label>
                    <input
                      required
                      type="number"
                      value={ticketForm.price}
                      onChange={(e) =>
                        setTicketForm({
                          ...ticketForm,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full bg-dark-gray border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-soft-pink focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-white/60 font-label">
                      Kapasitas
                    </label>
                    <input
                      required
                      type="number"
                      value={ticketForm.available_seats}
                      onChange={(e) =>
                        setTicketForm({
                          ...ticketForm,
                          available_seats: Number(e.target.value),
                        })
                      }
                      className="w-full bg-dark-gray border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-soft-pink focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-lg text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg text-sm font-bold bg-soft-pink text-charcoal hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
