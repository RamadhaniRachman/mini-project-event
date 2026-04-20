export default function Reports() {
  return (
    <div className="p-4 md:p-8 max-w-400 mx-auto animate-in fade-in duration-500 pb-24 md:pb-12 space-y-12">
      {/* Header & Filter Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <span className="text-light-pink font-headline text-xs font-bold uppercase tracking-[0.2em]">
            Data Insights
          </span>
          <h2 className="text-4xl font-headline font-extrabold tracking-tighter text-white">
            Laporan Analitik
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-dark-gray border border-white/5 p-1 rounded-xl">
            <button className="px-4 py-2 text-xs font-bold rounded-lg text-white/40 hover:text-white transition-colors">
              Harian
            </button>
            <button className="px-4 py-2 text-xs font-bold rounded-lg bg-charcoal text-soft-pink shadow-sm border border-white/5">
              Bulanan
            </button>
            <button className="px-4 py-2 text-xs font-bold rounded-lg text-white/40 hover:text-white transition-colors">
              Tahunan
            </button>
            <button className="px-4 py-2 text-xs font-bold rounded-lg text-white/40 hover:text-white transition-colors flex items-center gap-1">
              Custom{" "}
              <span className="material-symbols-outlined text-sm">
                calendar_today
              </span>
            </button>
          </div>
          <button className="flex items-center gap-2 bg-soft-pink/10 border border-soft-pink/20 text-soft-pink font-bold px-5 py-2.5 rounded-xl hover:bg-soft-pink/20 transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Download Report</span>
          </button>
        </div>
      </section>

      {/* Bento Grid Analytics */}
      <section className="grid grid-cols-12 gap-6">
        {/* Main Line Chart: Pertumbuhan Penjualan */}
        <div className="col-span-12 lg:col-span-8 bg-dark-gray border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="font-headline font-bold text-xl mb-1">
                Pertumbuhan Penjualan
              </h3>
              <p className="text-white/40 text-sm italic">
                Pendapatan kotor vs tiket terjual
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-soft-pink shadow-[0_0_8px_rgba(255,143,199,0.5)]"></span>
                <span className="text-white/60 uppercase tracking-wider">
                  Revenue
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white/20"></span>
                <span className="text-white/60 uppercase tracking-wider">
                  Tickets
                </span>
              </div>
            </div>
          </div>
          {/* Mock Line Chart */}
          <div className="h-64 flex items-end justify-between gap-2 relative">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-t border-white/5"></div>
              <div className="w-full border-t border-white/5"></div>
              <div className="w-full border-t border-white/5"></div>
              <div className="w-full border-t border-white/5"></div>
            </div>
            {/* Bars/Lines visualization */}
            <div className="flex-1 bg-linear-to-t from-soft-pink/20 to-soft-pink/5 h-[40%] rounded-t-lg relative group/bar hover:from-soft-pink/30">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-soft-pink"></div>
            </div>
            <div className="flex-1 bg-linear-to-t from-soft-pink/20 to-soft-pink/5 h-[55%] rounded-t-lg relative group/bar hover:from-soft-pink/30">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-soft-pink"></div>
            </div>
            <div className="flex-1 bg-linear-to-t from-soft-pink/20 to-soft-pink/5 h-[45%] rounded-t-lg relative group/bar hover:from-soft-pink/30">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-soft-pink"></div>
            </div>
            <div className="flex-1 bg-linear-to-t from-soft-pink/20 to-soft-pink/5 h-[75%] rounded-t-lg relative group/bar hover:from-soft-pink/30">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-soft-pink"></div>
            </div>
            <div className="flex-1 bg-linear-to-t from-soft-pink/30 to-soft-pink/10 h-[90%] rounded-t-lg relative group/bar border-t border-soft-pink/50">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-light-pink shadow-[0_0_15px_rgba(255,193,227,0.8)]"></div>
            </div>
            <div className="flex-1 bg-linear-to-t from-soft-pink/20 to-soft-pink/5 h-[65%] rounded-t-lg relative group/bar hover:from-soft-pink/30">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-soft-pink"></div>
            </div>
            <div className="flex-1 bg-linear-to-t from-soft-pink/20 to-soft-pink/5 h-[80%] rounded-t-lg relative group/bar hover:from-soft-pink/30">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-soft-pink"></div>
            </div>
          </div>
          <div className="flex justify-between mt-4 px-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
            <span>Min</span>
          </div>
        </div>

        {/* Pie Chart: Demografi Penonton */}
        <div className="col-span-12 lg:col-span-4 bg-dark-gray border border-white/5 rounded-2xl p-8 flex flex-col">
          <h3 className="font-headline font-bold text-xl mb-1">
            Demografi Penonton
          </h3>
          <p className="text-white/40 text-sm italic mb-8">
            Berdasarkan Rentang Usia
          </p>
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            <div className="relative w-48 h-48 rounded-full border-16 border-charcoal flex items-center justify-center">
              {/* Mock Pie Segments */}
              <div className="absolute inset-0 rounded-full border-16p border-soft-pink border-t-transparent border-l-transparent rotate-[45deg] shadow-[0_0_20px_rgba(255,143,199,0.15)] pointer-events-none"></div>
              <div className="absolute inset-0 rounded-full border-16 border-light-pink/40 border-b-transparent border-r-transparent -rotate-[15deg] pointer-events-none"></div>
              <div className="text-center z-10">
                <span className="block text-3xl font-black text-soft-pink">
                  64%
                </span>
                <span className="text-[10px] uppercase tracking-tighter text-white/40">
                  Gen Z (18-24)
                </span>
              </div>
            </div>
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-soft-pink"></div>
                  <span className="text-white/80">18 - 24 Tahun</span>
                </div>
                <span className="font-bold">64.2%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-light-pink/40"></div>
                  <span className="text-white/80">25 - 34 Tahun</span>
                </div>
                <span className="font-bold">22.8%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-charcoal border border-white/20"></div>
                  <span className="text-white/80">Lainnya</span>
                </div>
                <span className="font-bold">13.0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart: Sumber Trafik */}
        <div className="col-span-12 lg:col-span-5 bg-dark-gray border border-white/5 rounded-2xl p-8">
          <h3 className="font-headline font-bold text-xl mb-1">
            Sumber Trafik
          </h3>
          <p className="text-white/40 text-sm italic mb-8">
            Asal usul konversi tiket
          </p>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-white/60">Social Media (IG/TikTok)</span>
                <span className="text-soft-pink">45%</span>
              </div>
              <div className="h-3 bg-charcoal rounded-full overflow-hidden">
                <div className="h-full bg-soft-pink w-[45%] rounded-full shadow-[0_0_10px_rgba(255,143,199,0.5)]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-white/60">Direct Search / Web</span>
                <span className="text-soft-pink">30%</span>
              </div>
              <div className="h-3 bg-charcoal rounded-full overflow-hidden">
                <div className="h-full bg-soft-pink w-[30%] rounded-full opacity-90"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-white/60">Email Marketing</span>
                <span className="text-soft-pink">15%</span>
              </div>
              <div className="h-3 bg-charcoal rounded-full overflow-hidden">
                <div className="h-full bg-soft-pink w-[15%] rounded-full opacity-60"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-white/60">Referral Offline</span>
                <span className="text-soft-pink">10%</span>
              </div>
              <div className="h-3 bg-charcoal rounded-full overflow-hidden">
                <div className="h-full bg-soft-pink w-[10%] rounded-full opacity-40"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Top Performing Events */}
        <div className="col-span-12 lg:col-span-7 bg-dark-gray border border-white/5 rounded-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline font-bold text-xl mb-1">
                Top Performing Events
              </h3>
              <p className="text-white/40 text-sm italic">
                Peringkat berdasarkan volume penjualan
              </p>
            </div>
            <button className="text-soft-pink text-xs font-bold hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {/* Event Row 1 */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-charcoal/50 hover:bg-charcoal border border-transparent hover:border-white/5 transition-colors group">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                  alt="Neon Night"
                  src="https://images.unsplash.com/photo-1540039155732-684735035727?auto=format&fit=crop&q=80&w=200"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white group-hover:text-soft-pink transition-colors">
                  Neon Night: Seoul Pulse
                </h4>
                <p className="text-xs text-white/40">
                  Stadium Gelora Bung Karno • 24 Oct
                </p>
              </div>
              <div className="text-right">
                <div className="font-black text-soft-pink tracking-tight">
                  Rp 1.2B
                </div>
                <div className="text-[10px] uppercase text-white/40 font-bold">
                  12,403 Tiket
                </div>
              </div>
              <div className="pl-4">
                <span
                  className="material-symbols-outlined text-green-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  trending_up
                </span>
              </div>
            </div>

            {/* Event Row 2 */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-charcoal/50 hover:bg-charcoal border border-transparent hover:border-white/5 transition-colors group">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                  alt="Couture Gala"
                  src="https://images.unsplash.com/photo-1509283038676-4318788a101b?auto=format&fit=crop&q=80&w=200"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white group-hover:text-soft-pink transition-colors">
                  Midnight Couture Gala
                </h4>
                <p className="text-xs text-white/40">
                  The Ritz-Carlton • 12 Nov
                </p>
              </div>
              <div className="text-right">
                <div className="font-black text-white tracking-tight">
                  Rp 840M
                </div>
                <div className="text-[10px] uppercase text-white/40 font-bold">
                  2,100 Tiket
                </div>
              </div>
              <div className="pl-4">
                <span
                  className="material-symbols-outlined text-green-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  trending_up
                </span>
              </div>
            </div>

            {/* Event Row 3 */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-charcoal/50 hover:bg-charcoal border border-transparent hover:border-white/5 transition-colors group">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-charcoal border border-white/5">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-50 grayscale"
                  alt="Vinyl Record"
                  src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white group-hover:text-soft-pink transition-colors">
                  Vibe Check: Indie Underground
                </h4>
                <p className="text-xs text-white/40">
                  Live House Jakarta • 05 Dec
                </p>
              </div>
              <div className="text-right">
                <div className="font-black text-white tracking-tight">
                  Rp 320M
                </div>
                <div className="text-[10px] uppercase text-white/40 font-bold">
                  5,800 Tiket
                </div>
              </div>
              <div className="pl-4">
                <span className="material-symbols-outlined text-white/20">
                  horizontal_rule
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
