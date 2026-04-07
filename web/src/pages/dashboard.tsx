import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

export default function Dashboard() {
  const location = useLocation(); // Mendeteksi URL aktif untuk efek warna tombol
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // 1. Pengecekan akses (protected)
  useEffect(() => {
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

  return (
    <div className="dark bg-charcoal font-body text-white min-h-screen selection:bg-soft-pink selection:text-charcoal">
      {/* --- SIDEBAR --- */}
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
          <Link
            to="/dashboard"
            className={`flex items-center gap-4 px-4 py-3.5 font-semibold transition-all rounded-lg ${
              location.pathname === "/dashboard"
                ? "text-soft-pink bg-soft-pink/10 border-r-4 border-soft-pink rounded-l-lg rounded-r-none"
                : "text-white/40 font-medium hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label uppercase tracking-widest text-xs">
              Dashboard
            </span>
          </Link>
          <Link
            to="/dashboard/events"
            className={`flex items-center gap-4 px-4 py-3.5 font-semibold transition-all rounded-lg ${
              location.pathname.includes("/events")
                ? "text-soft-pink bg-soft-pink/10 border-r-4 border-soft-pink rounded-l-lg rounded-r-none"
                : "text-white/40 font-medium hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined">event</span>
            <span className="font-label uppercase tracking-widest text-xs">
              My Events
            </span>
          </Link>
          <Link
            to="/dashboard/transactions"
            className={`flex items-center gap-4 px-4 py-3.5 font-semibold transition-all rounded-lg ${
              location.pathname.includes("/transactions")
                ? "text-soft-pink bg-soft-pink/10 border-r-4 border-soft-pink rounded-l-lg rounded-r-none"
                : "text-white/40 font-medium hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined">payments</span>
            <span className="font-label uppercase tracking-widest text-xs">
              Transactions
            </span>
          </Link>
          <Link
            to="/dashboard/reports"
            className="flex items-center gap-4 px-4 py-3.5 text-white/40 font-medium hover:bg-white/5 hover:text-white transition-all rounded-lg"
          >
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-label uppercase tracking-widest text-xs">
              Reports
            </span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-4 px-4 py-3.5 text-white/40 font-medium hover:bg-white/5 hover:text-white transition-all rounded-lg"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label uppercase tracking-widest text-xs">
              Settings
            </span>
          </Link>
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

      <main className="md:ml-72 min-h-screen relative flex flex-col pb-16 md:pb-0">
        {/* --- HEADER --- */}
        <header className="sticky top-0 z-40 bg-charcoal/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 py-4 w-full border-b border-white/5 shadow-xl shadow-black/20">
          <div className="flex items-center gap-8">
            <h2 className="font-headline text-xl font-bold tracking-tighter text-soft-pink hidden lg:block">
              DASHBOARD MANAJEMEN
            </h2>
            <div className="flex items-center bg-dark-gray rounded-full px-4 py-2 border border-white/10">
              <span className="material-symbols-outlined text-white/40 text-sm mr-2">
                search
              </span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm text-white w-40 md:w-64 placeholder:text-white/40 outline-none"
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
                <p className="text-sm font-bold text-white leading-tight capitalize">
                  {user.name}
                </p>
                <p className="text-[10px] text-soft-pink uppercase tracking-widest">
                  Senior {user.role}
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

        {/* --- LUBANG KONTEN DINAMIS --- */}
        <div className="flex-1 w-full">
          <Outlet context={{ user }} />
        </div>

        {/* Floating Action Button (Mobile Only) */}
        <button className="fixed bottom-24 right-6 w-14 h-14 stage-gradient rounded-full shadow-2xl flex items-center justify-center text-charcoal hover:scale-110 active:scale-95 transition-all z-50 md:hidden">
          <span className="material-symbols-outlined text-2xl font-bold">
            add
          </span>
        </button>
      </main>

      {/* --- BOTTOM NAVBAR (MOBILE) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-gray/90 backdrop-blur-md border-t border-white/10 flex justify-around items-center py-3 px-2 z-50">
        <Link
          className={`flex flex-col items-center gap-1 ${location.pathname === "/dashboard" ? "text-soft-pink" : "text-white/40"}`}
          to="/dashboard"
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontVariationSettings:
                location.pathname === "/dashboard" ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            dashboard
          </span>
          <span className="text-[10px] font-bold">Dash</span>
        </Link>
        <Link
          className="flex flex-col items-center gap-1 text-white/40 hover:text-white"
          to="/events"
        >
          <span className="material-symbols-outlined">event</span>
          <span className="text-[10px] font-bold">Event</span>
        </Link>
        <Link
          className={`flex flex-col items-center gap-1 ${location.pathname.includes("/transactions") ? "text-soft-pink" : "text-white/40"}`}
          to="/dashboard/transactions"
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontVariationSettings: location.pathname.includes("/transactions")
                ? "'FILL' 1"
                : "'FILL' 0",
            }}
          >
            payments
          </span>
          <span className="text-[10px] font-bold">Trans</span>
        </Link>
        <Link
          className="flex flex-col items-center gap-1 text-white/40 hover:text-white"
          to="/reports"
        >
          <span className="material-symbols-outlined">analytics</span>
          <span className="text-[10px] font-bold">Rep</span>
        </Link>
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
