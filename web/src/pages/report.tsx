import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Reports() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"HARIAN" | "BULANAN">("HARIAN");

  // States Data
  const [topEvents, setTopEvents] = useState<any[]>([]);
  const [chartData, setChartData] = useState<
    { label: string; revenue: number }[]
  >([]);
  const [maxRevenue, setMaxRevenue] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchReports = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/events/reports",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.ok) {
          const result = await response.json();
          setTopEvents(result.data.topEvents);
          processChartData(result.data.transactions, filterMode);
        }
      } catch (error) {
        console.error("Gagal load report", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Memproses ulang grafik jika tombol filter (Harian/Bulanan) diklik
  const processChartData = (transactions: any[], mode: string) => {
    let rawData: { label: string; revenue: number }[] = [];

    if (mode === "HARIAN") {
      // Hitung 7 Hari Terakhir
      const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          dateString: d.toDateString(),
          label: days[d.getDay()],
          revenue: 0,
        };
      });

      transactions.forEach((trx) => {
        const trxDate = new Date(trx.created_at).toDateString();
        const dayMatch = last7Days.find((d) => d.dateString === trxDate);
        if (dayMatch) dayMatch.revenue += trx.final_price;
      });
      rawData = last7Days;
    } else {
      // Hitung 12 Bulan (Jan - Des)
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Ags",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];
      const currentYear = new Date().getFullYear();
      const monthData = months.map((m) => ({ label: m, revenue: 0 }));

      transactions.forEach((trx) => {
        const date = new Date(trx.created_at);
        if (date.getFullYear() === currentYear) {
          monthData[date.getMonth()].revenue += trx.final_price;
        }
      });
      rawData = monthData;
    }

    setChartData(rawData);
    // Cari nilai tertinggi untuk menghitung persentase tinggi grafik batang
    const maxVal = Math.max(...rawData.map((d) => d.revenue), 100000); // minimal 100rb agar grafik tidak error
    setMaxRevenue(maxVal);
  };

  // Handler Ganti Filter
  const handleFilterChange = (mode: "HARIAN" | "BULANAN") => {
    setFilterMode(mode);
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/api/events/reports", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((result) => processChartData(result.data.transactions, mode));
  };

  // Format Helper
  const formatRupiah = (angka: number) => {
    if (angka >= 1000000000) return `Rp ${(angka / 1000000000).toFixed(1)}M`;
    if (angka >= 1000000) return `Rp ${(angka / 1000000).toFixed(1)}Jt`;
    return `Rp ${angka.toLocaleString("id-ID")}`;
  };
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center text-soft-pink font-bold animate-pulse tracking-widest text-xl">
        MENGANALISIS DATA...
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-24 md:pb-12 space-y-12">
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
            <button
              onClick={() => handleFilterChange("HARIAN")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${filterMode === "HARIAN" ? "bg-charcoal text-soft-pink border border-white/5" : "text-white/40 hover:text-white"}`}
            >
              Harian
            </button>
            <button
              onClick={() => handleFilterChange("BULANAN")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${filterMode === "BULANAN" ? "bg-charcoal text-soft-pink border border-white/5" : "text-white/40 hover:text-white"}`}
            >
              Bulanan
            </button>
            <button className="px-4 py-2 text-xs font-bold rounded-lg text-white/20 cursor-not-allowed">
              Tahunan
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
                Pendapatan kotor event ({filterMode.toLowerCase()})
              </p>
            </div>
          </div>

          {/* Dynamic Chart Area */}
          <div className="h-64 flex items-end justify-between gap-2 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-t border-white/5"></div>
              <div className="w-full border-t border-white/5"></div>
              <div className="w-full border-t border-white/5"></div>
              <div className="w-full border-t border-white/5"></div>
            </div>

            {/* Generate Bars Dynamically */}
            {chartData.map((data, idx) => {
              // Hitung persentase tinggi berdasarkan maxRevenue
              const heightPercent = Math.max(
                (data.revenue / maxRevenue) * 100,
                2,
              ); // Minimal 2% biar ada wujud baloknya

              return (
                <div
                  key={idx}
                  style={{ height: `${heightPercent}%` }}
                  className="flex-1 bg-gradient-to-t from-soft-pink/20 to-soft-pink/5 rounded-t-lg relative group/bar hover:from-soft-pink/40 cursor-pointer transition-all duration-500 flex justify-center"
                >
                  <div className="absolute -top-1 w-2 h-2 rounded-full bg-soft-pink group-hover/bar:scale-150 transition-transform"></div>
                  {/* Tooltip Hover */}
                  <div className="absolute -top-10 bg-charcoal text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap border border-white/10 z-20">
                    {formatRupiah(data.revenue)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between mt-4 px-2 text-[10px] text-white/40 font-bold uppercase tracking-widest">
            {chartData.map((d, i) => (
              <span key={i} className="text-center flex-1">
                {d.label}
              </span>
            ))}
          </div>
        </div>

        {/* Section: Top Performing Events (DINAMIS DARI DATABASE) */}
        <div className="col-span-12 bg-dark-gray border border-white/5 rounded-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline font-bold text-xl mb-1">
                Top Performing Events
              </h3>
              <p className="text-white/40 text-sm italic">
                Peringkat berdasarkan volume penjualan (Sukses)
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {topEvents.length === 0 ? (
              <div className="text-center py-8 text-white/40 italic">
                Belum ada data penjualan.
              </div>
            ) : (
              topEvents.map((event, index) => {
                const imgUrl = event.image_url
                  ? event.image_url.startsWith("http")
                    ? event.image_url
                    : `http://localhost:8000${event.image_url}`
                  : "https://images.unsplash.com/photo-1540039155732-684735035727?auto=format&fit=crop&q=80&w=200";

                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-charcoal/50 hover:bg-charcoal border border-transparent hover:border-white/5 transition-colors group"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center font-bold text-white bg-charcoal">
                      <img
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60"
                        alt={event.title}
                        src={imgUrl}
                      />
                      <span className="relative z-10 text-xl drop-shadow-md">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white group-hover:text-soft-pink transition-colors truncate max-w-[200px] sm:max-w-md">
                        {event.title}
                      </h4>
                      <p className="text-xs text-white/40">
                        {event.location} • {formatDate(event.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-soft-pink tracking-tight">
                        {formatRupiah(event.revenue)}
                      </div>
                      <div className="text-[10px] uppercase text-white/40 font-bold">
                        {event.tickets} Tiket
                      </div>
                    </div>
                    <div className="pl-4 hidden sm:block">
                      <span
                        className="material-symbols-outlined text-green-400"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        trending_up
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
