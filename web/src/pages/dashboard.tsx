import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // 1. Pengecekan akses (protected)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    // Kalo gk ada token, kembalikan ke login
    if (!token || !userString) {
      window.location.href = "/login";
      return;
    }

    const userData = JSON.parse(userString);

    // Jika rolenya user maka arahkan ke home, jika tidak maka ke dashboard
    // Amankan pengecekan role dengan toLowerCase()
    const userRole = String(userData.role || "").toLowerCase();

    // Jika rolenya BUKAN organizer maka arahkan ke home
    if (userRole !== "organizer") {
      window.location.href = "/";
      return;
    }

    // Jika lolos semua, simpan data user ke state untuk ditampilkan
    setUser(userData);
  }, []);

  // 2. Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Selama proses pengecekan (sepersekian detik), tampilkan layar loading
  if (!user) {
    return (
      <div className="min-h-screen bg-charcoal flex justify-center items-center text-soft-pink font-headline font-bold text-xl tracking-widest animate-pulse">
        MEMUAT STAGE...
      </div>
    );
  }

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
          <button className="w-full py-4 stage-gradient text-charcoal font-bold rounded-xl flex items-center justify-center gap-2 mb-10 hover:scale-[1.02] active:scale-95 transition-all">
            <span className="material-symbols-outlined">add_circle</span>
            <span>Create Event</span>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {/* Dashboard Active */}
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
          <a
            className="flex items-center gap-4 px-4 py-3.5 text-white/40 font-medium hover:bg-white/5 hover:text-white transition-all rounded-lg"
            href="#"
          >
            <span className="material-symbols-outlined">payments</span>
            <span className="font-label uppercase tracking-widest text-xs">
              Transactions
            </span>
          </a>
          <a
            className="flex items-center gap-4 px-4 py-3.5 text-white/40 font-medium hover:bg-white/5 hover:text-white transition-all rounded-lg"
            href="#"
          >
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-label uppercase tracking-widest text-xs">
              Reports
            </span>
          </a>
          <a
            className="flex items-center gap-4 px-4 py-3.5 text-white/40 font-medium hover:bg-white/5 hover:text-white transition-all rounded-lg"
            href="#"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label uppercase tracking-widest text-xs">
              Settings
            </span>
          </a>
        </nav>

        <div className="px-4 mt-auto space-y-2">
          <a
            className="flex items-center gap-4 px-4 py-3.5 text-white/40 font-medium hover:bg-white/5 hover:text-white transition-all rounded-lg"
            href="#"
          >
            <span className="material-symbols-outlined">help</span>
            <span className="font-label uppercase tracking-widest text-xs">
              Help Center
            </span>
          </a>
          {/* Tombol Logout Terintegrasi */}
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
            <div className="hidden lg:flex items-center bg-dark-gray rounded-full px-4 py-2 border border-white/10">
              <span className="material-symbols-outlined text-white/40 text-sm mr-2">
                search
              </span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm text-white w-64 placeholder:text-white/40 outline-none"
                placeholder="Cari event atau transaksi..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-white/60 hover:text-soft-pink transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-light-pink rounded-full border-2 border-charcoal"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/20">
              <div className="text-right hidden sm:block">
                {/* Data User Dinamis */}
                <p className="text-sm font-bold text-white leading-tight capitalize">
                  {user.name}
                </p>
                <p className="text-[10px] text-soft-pink uppercase tracking-widest">
                  {user.role}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border border-soft-pink/20 bg-dark-gray flex items-center justify-center">
                {/* Fallback Inisial User jika gambar tidak ada */}
                <span className="font-bold text-soft-pink">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto space-y-12">
          {/* Section 1: Summary Stats & Filter */}
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
              <div className="inline-flex bg-dark-gray p-1 rounded-xl">
                <button className="px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all">
                  Harian
                </button>
                <button className="px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest bg-charcoal text-soft-pink shadow-inner transition-all border border-white/5">
                  Bulanan
                </button>
                <button className="px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all">
                  Tahunan
                </button>
              </div>
            </div>

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-dark-gray p-6 rounded-xl space-y-4 hover:bg-charcoal border border-white/5 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-lg bg-soft-pink/10 text-soft-pink group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">
                    +12.5%
                  </span>
                </div>
                <div>
                  <p className="text-white/70 text-xs font-label uppercase tracking-widest">
                    Total Penjualan
                  </p>
                  <h4 className="text-2xl font-black mt-1">Rp 452.8M</h4>
                </div>
              </div>
              <div className="bg-dark-gray p-6 rounded-xl space-y-4 hover:bg-charcoal border border-white/5 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-lg bg-soft-pink/10 text-soft-pink group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">
                      confirmation_number
                    </span>
                  </div>
                  <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">
                    +8.2%
                  </span>
                </div>
                <div>
                  <p className="text-white/70 text-xs font-label uppercase tracking-widest">
                    Tiket Terjual
                  </p>
                  <h4 className="text-2xl font-black mt-1">12,450</h4>
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
                  <h4 className="text-2xl font-black mt-1">24</h4>
                </div>
              </div>
              <div className="bg-dark-gray p-6 rounded-xl space-y-4 hover:bg-charcoal border border-white/5 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-lg bg-soft-pink/10 text-soft-pink group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">
                      person_add
                    </span>
                  </div>
                  <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">
                    +45
                  </span>
                </div>
                <div>
                  <p className="text-white/70 text-xs font-label uppercase tracking-widest">
                    Registrasi Baru
                  </p>
                  <h4 className="text-2xl font-black mt-1">1,208</h4>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Data Visualization */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-dark-gray border border-white/5 rounded-2xl p-8 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="font-headline text-xl font-bold">
                    Tren Penjualan
                  </h3>
                  <p className="text-white/70 text-xs">
                    Visualisasi bulanan tahun 2024
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
              {/* Simulated Chart Canvas */}
              <div className="h-[300px] w-full flex items-end gap-2 px-4 relative">
                <div className="absolute inset-0 flex items-end justify-between px-4 pb-8 opacity-20">
                  <div className="w-full border-b border-white/30 h-1/4"></div>
                  <div className="w-full border-b border-white/30 h-2/4"></div>
                  <div className="w-full border-b border-white/30 h-3/4"></div>
                </div>
                <div className="flex-1 bg-soft-pink/20 hover:bg-soft-pink/40 transition-colors rounded-t-sm h-[40%] relative group">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-charcoal px-2 py-1 rounded text-[10px] hidden group-hover:block border border-white/10">
                    Jan
                  </div>
                </div>
                <div className="flex-1 bg-soft-pink/20 hover:bg-soft-pink/40 transition-colors rounded-t-sm h-[65%]"></div>
                <div className="flex-1 bg-soft-pink/20 hover:bg-soft-pink/40 transition-colors rounded-t-sm h-[55%]"></div>
                <div className="flex-1 bg-soft-pink/20 hover:bg-soft-pink/40 transition-colors rounded-t-sm h-[85%]"></div>
                <div className="flex-1 bg-soft-pink/40 rounded-t-sm h-[95%] referral-glow relative">
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
                <h3 className="font-headline text-xl font-bold">
                  Kapasitas Venue
                </h3>
                <p className="text-white/70 text-xs">
                  Rata-rata okupansi saat ini
                </p>
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
                    <span className="text-4xl font-black text-soft-pink">
                      75%
                    </span>
                    <span className="text-[10px] font-label uppercase tracking-widest opacity-60">
                      Terisi
                    </span>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/70">Tiket VIP</span>
                    <span className="font-bold">92%</span>
                  </div>
                  <div className="w-full h-1 bg-charcoal rounded-full overflow-hidden">
                    <div className="h-full bg-soft-pink w-[92%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: My Events Grid */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-2xl font-extrabold tracking-tight">
                Event Saya
              </h3>
              <button className="text-soft-pink text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:underline">
                Lihat Semua{" "}
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {/* Event Card 1 */}
              <div className="bg-dark-gray rounded-xl overflow-hidden group border border-white/5">
                <div className="h-48 relative overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                    alt="Event background"
                    src="https://images.unsplash.com/photo-1540039155732-684735035727?auto=format&fit=crop&q=80&w=800"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-gray via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4 bg-green-500/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md">
                    On Sale
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h4 className="text-lg font-bold group-hover:text-soft-pink transition-colors leading-tight">
                    NEON NIGHTS: World Tour 2024
                  </h4>
                  <div className="flex items-center gap-4 text-white/70 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        calendar_today
                      </span>
                      <span>25 Okt 2024</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        location_on
                      </span>
                      <span>GBK, Jakarta</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/70 font-label uppercase tracking-widest">
                        Penjualan
                      </p>
                      <p className="text-sm font-bold">8,420 / 10,000</p>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full border-2 border-dark-gray bg-charcoal"></div>
                      <div className="w-6 h-6 rounded-full border-2 border-dark-gray bg-charcoal"></div>
                      <div className="w-6 h-6 rounded-full border-2 border-dark-gray bg-charcoal flex items-center justify-center text-[8px] font-bold text-white">
                        +1k
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Card 2 */}
              <div className="bg-dark-gray rounded-xl overflow-hidden group border border-white/5">
                <div className="h-48 relative overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                    alt="Event background"
                    src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-gray via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4 bg-soft-pink text-charcoal text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md">
                    Completed
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h4 className="text-lg font-bold group-hover:text-soft-pink transition-colors leading-tight">
                    Acoustic Session: Pink Sunset
                  </h4>
                  <div className="flex items-center gap-4 text-white/70 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        calendar_today
                      </span>
                      <span>12 Sep 2024</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        location_on
                      </span>
                      <span>Teater Kecil, TIM</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/70 font-label uppercase tracking-widest">
                        Penjualan
                      </p>
                      <p className="text-sm font-bold">500 / 500 (Sold Out)</p>
                    </div>
                    <button className="text-soft-pink text-xs font-bold underline">
                      Lihat Laporan
                    </button>
                  </div>
                </div>
              </div>

              {/* Event Card 3 */}
              <div className="bg-dark-gray rounded-xl overflow-hidden group border border-white/5">
                <div className="h-48 relative overflow-hidden bg-charcoal">
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-gray via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4 bg-charcoal border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md">
                    Draft
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h4 className="text-lg font-bold group-hover:text-soft-pink transition-colors leading-tight">
                    Digital Arts Festival 2025
                  </h4>
                  <div className="flex items-center gap-4 text-white/70 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        calendar_today
                      </span>
                      <span>TBA</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        location_on
                      </span>
                      <span>ICE BSD, Tangerang</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/70 font-label uppercase tracking-widest">
                        Progress
                      </p>
                      <p className="text-sm font-bold">45% Selesai</p>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-charcoal border border-white/5 flex items-center justify-center text-white hover:bg-soft-pink hover:text-charcoal transition-colors">
                      <span className="material-symbols-outlined text-sm">
                        edit
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Recent Transactions */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-2xl font-extrabold tracking-tight">
                Transaksi Terbaru
              </h3>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-dark-gray border border-white/5 rounded-lg text-xs font-bold hover:bg-charcoal transition-all">
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
                      <th className="px-8 py-5 text-[10px] font-label uppercase tracking-widest text-white/70">
                        Pembeli
                      </th>
                      <th className="px-8 py-5 text-[10px] font-label uppercase tracking-widest text-white/70">
                        Event
                      </th>
                      <th className="px-8 py-5 text-[10px] font-label uppercase tracking-widest text-white/70 text-center">
                        Tiket
                      </th>
                      <th className="px-8 py-5 text-[10px] font-label uppercase tracking-widest text-white/70">
                        Jumlah
                      </th>
                      <th className="px-8 py-5 text-[10px] font-label uppercase tracking-widest text-white/70">
                        Tanggal
                      </th>
                      <th className="px-8 py-5 text-[10px] font-label uppercase tracking-widest text-white/70 text-right">
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
                            <p className="text-sm font-bold">Adi Wijaya</p>
                            <p className="text-[10px] text-white/70">
                              adi.w@mail.com
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium">
                        NEON NIGHTS World Tour
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="px-2 py-1 bg-soft-pink/10 text-soft-pink text-[10px] font-bold rounded border border-soft-pink/20">
                          2x VIP
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-black">
                        Rp 5,500,000
                      </td>
                      <td className="px-8 py-5 text-sm text-white/70">
                        2 Menit yang lalu
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-[10px] font-black uppercase text-green-400">
                          Berhasil
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-charcoal transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-charcoal border border-white/5 flex items-center justify-center text-[10px] font-bold text-soft-pink">
                            RN
                          </div>
                          <div>
                            <p className="text-sm font-bold">Rina Novianti</p>
                            <p className="text-[10px] text-white/70">
                              rina.nv@mail.com
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium">
                        Pink Sunset Acoustic
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="px-2 py-1 bg-charcoal text-white/60 text-[10px] font-bold rounded border border-white/10">
                          1x Reg
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-black">
                        Rp 450,000
                      </td>
                      <td className="px-8 py-5 text-sm text-white/70">
                        15 Menit yang lalu
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-[10px] font-black uppercase text-green-400">
                          Berhasil
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-charcoal transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-charcoal border border-white/5 flex items-center justify-center text-[10px] font-bold text-soft-pink">
                            BS
                          </div>
                          <div>
                            <p className="text-sm font-bold">Budi Santoso</p>
                            <p className="text-[10px] text-white/70">
                              budisant@mail.com
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium">
                        NEON NIGHTS World Tour
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="px-2 py-1 bg-soft-pink/10 text-soft-pink text-[10px] font-bold rounded border border-soft-pink/20">
                          4x CAT 1
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-black">
                        Rp 8,000,000
                      </td>
                      <td className="px-8 py-5 text-sm text-white/70">
                        1 Jam yang lalu
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-[10px] font-black uppercase text-red-400">
                          Pending
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-dark-gray flex justify-center border-t border-white/5">
                <button className="px-8 py-2 text-xs font-bold uppercase tracking-widest border border-white/20 rounded-lg hover:bg-charcoal hover:border-white/40 transition-all">
                  Muat Lebih Banyak
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Floating Action Button (Mobile Only) */}
        <button className="fixed bottom-24 right-8 w-16 h-16 stage-gradient rounded-full shadow-2xl flex items-center justify-center text-charcoal hover:scale-110 active:scale-95 transition-all z-50 group md:hidden">
          <span className="material-symbols-outlined text-3xl font-bold">
            add
          </span>
        </button>
      </main>

      {/* BottomNavBar Shell (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-gray/90 backdrop-blur-md border-t border-white/10 flex justify-around items-center py-3 px-4 z-50">
        <a className="flex flex-col items-center gap-1 text-soft-pink" href="#">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            dashboard
          </span>
          <span className="text-[10px] font-bold">Dash</span>
        </a>
        <a
          className="flex flex-col items-center gap-1 text-white/40 hover:text-white"
          href="#"
        >
          <span className="material-symbols-outlined">event</span>
          <span className="text-[10px] font-bold">Event</span>
        </a>
        <a
          className="flex flex-col items-center gap-1 text-white/40 hover:text-white"
          href="#"
        >
          <span className="material-symbols-outlined">payments</span>
          <span className="text-[10px] font-bold">Trans</span>
        </a>
        <a
          className="flex flex-col items-center gap-1 text-white/40 hover:text-white"
          href="#"
        >
          <span className="material-symbols-outlined">analytics</span>
          <span className="text-[10px] font-bold">Rep</span>
        </a>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 text-red-400/60 hover:text-red-400"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-[10px] font-bold">Keluar</span>
        </button>
      </nav>
    </div>
  );
}
