import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface EventItem {
  id: number;
  title: string;
}

interface PromoItem {
  id: number;
  promo_code: string;
  discount_value: number;
  discount_type: string;
  quota: number;
  valid_from: string;
  valid_until: string;
  event: { title: string; image_url: string | null };
}

export default function Promotions() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // States untuk Form
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [discountType, setDiscountType] = useState("NOMINAL"); // Atau PERCENTAGE
  const [quota, setQuota] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");

  // States untuk Daftar Promo
  const [promotions, setPromotions] = useState<PromoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(userString);
    if (String(userData.role || "").toLowerCase() !== "organizer") {
      navigate("/");
      return;
    }
    setUser(userData);

    // Fetch Data (Events untuk Dropdown & Daftar Promo)
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [eventsRes, promoRes] = await Promise.all([
          fetch("http://localhost:8000/api/events/list", { headers }),
          fetch("http://localhost:8000/api/events/promotions/list", {
            headers,
          }),
        ]);

        if (eventsRes.ok) {
          const evData = await eventsRes.json();
          setEvents(evData.data || []);
          if (evData.data && evData.data.length > 0) {
            setSelectedEventId(evData.data[0].id.toString());
          }
        }

        if (promoRes.ok) {
          const prData = await promoRes.json();
          setPromotions(prData.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // FUNGSI MEMBUAT PROMO BARU
  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      alert("Silakan buat Event terlebih dahulu sebelum membuat Promo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/events/${selectedEventId}/promotions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            promo_code: promoCode,
            discount_value: Number(discountValue),
            discount_type: discountType,
            quota: Number(quota),
            valid_from: validFrom,
            valid_until: validUntil,
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        alert("Voucher berhasil diterbitkan!");
        // Refresh daftar promo
        setPromotions([result.data, ...promotions]);
        // Reset form
        setPromoCode("");
        setDiscountValue("");
        setQuota("");
      } else {
        alert(`Gagal: ${result.message}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper untuk format Rupiah/Persen
  const formatDiscount = (value: number, type: string) => {
    if (type === "PERCENTAGE") return `${value}%`;
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  // Helper cek status aktif
  const isPromoActive = (validUntil: string, quota: number) => {
    const isExpired = new Date(validUntil) < new Date();
    return !isExpired && quota > 0;
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-charcoal flex justify-center items-center text-soft-pink font-bold text-xl tracking-widest animate-pulse">
        MEMUAT STAGE...
      </div>
    );
  }

  // Hitung total redimensi (Asumsi: Kuota awal dikurangi kuota saat ini, untuk kemudahan kita tampilkan data mentah dulu)
  const activeVouchersCount = promotions.filter((p) =>
    isPromoActive(p.valid_until, p.quota),
  ).length;

  return (
    <div className="dark bg-charcoal font-body text-white min-h-screen selection:bg-soft-pink selection:text-charcoal pb-24 md:pb-0">
      {/* ... (Header tetap sama seperti kode Anda) ... */}
      <header className="fixed top-0 w-full z-50 bg-charcoal/80 backdrop-blur-xl transition-all shadow-[0px_10px_30px_rgba(0,0,0,0.3)] border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black text-soft-pink uppercase italic tracking-tighter font-headline">
              NOIR ROSE
            </span>
            <nav className="hidden md:flex items-center gap-6">
              <a
                className="text-white/60 font-headline font-bold tracking-tight hover:text-soft-pink transition-colors"
                href="/dashboard"
              >
                Dashboard
              </a>
              <a
                className="text-white/60 font-headline font-bold tracking-tight hover:text-soft-pink transition-colors"
                href="/events"
              >
                Events
              </a>
              <a
                className="text-soft-pink font-bold border-b-2 border-soft-pink font-headline tracking-tight"
                href="/promotions"
              >
                Offers
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-dark-gray border border-white/10 rounded-full px-4 py-2 items-center gap-2">
              <span className="material-symbols-outlined text-white/40 text-sm">
                search
              </span>
              <input
                className="bg-transparent border-none outline-none focus:ring-0 text-sm w-48 text-white placeholder-white/40"
                placeholder="Cari promo..."
                type="text"
              />
            </div>
            <span className="material-symbols-outlined text-white/60 hover:text-soft-pink transition-colors cursor-pointer hidden sm:block">
              notifications
            </span>

            <div className="group relative">
              <div className="w-8 h-8 rounded-full bg-dark-gray border border-soft-pink/30 flex items-center justify-center cursor-pointer hover:border-soft-pink transition-colors">
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
          </div>
        </div>
      </header>

      <main className="pt-28 pb-32 px-6 max-w-7xl mx-auto min-h-screen">
        {/* Editorial Header */}
        <div className="mb-12 relative">
          <span className="text-xs font-bold tracking-[0.2em] text-light-pink uppercase mb-2 block">
            Management Center
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white italic uppercase leading-none font-headline relative z-10">
            PROMOSI <br />
            <span className="text-soft-pink">& VOUCHER</span>
          </h1>
          <div className="absolute -top-4 -right-4 md:right-auto md:left-64 w-32 h-32 bg-soft-pink/10 blur-[60px] rounded-full pointer-events-none"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Section (Create New) */}
          <section className="lg:col-span-5 space-y-8">
            <div className="bg-dark-gray border border-white/5 p-8 rounded-xl relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-1 h-full bg-soft-pink"></div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 font-headline">
                <span className="material-symbols-outlined text-soft-pink">
                  add_circle
                </span>
                Buat Voucher Baru
              </h2>
              <form className="space-y-6" onSubmit={handleCreateVoucher}>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/60 mb-2">
                    Kode Voucher
                  </label>
                  <input
                    className="w-full bg-charcoal border border-white/10 rounded-lg p-4 text-white focus:ring-1 focus:ring-soft-pink/40 outline-none transition-all uppercase placeholder:text-white/20"
                    placeholder="CONTOH: ROSE2026"
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                {/* Tipe Diskon */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/60 mb-2">
                    Tipe Diskon
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="discountType"
                        value="NOMINAL"
                        checked={discountType === "NOMINAL"}
                        onChange={(e) => setDiscountType(e.target.value)}
                        className="accent-soft-pink"
                      />
                      Nominal (Rp)
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="discountType"
                        value="PERCENTAGE"
                        checked={discountType === "PERCENTAGE"}
                        onChange={(e) => setDiscountType(e.target.value)}
                        className="accent-soft-pink"
                      />
                      Persentase (%)
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/60 mb-2">
                      Nilai Diskon
                    </label>
                    <input
                      className="w-full bg-charcoal border border-white/10 rounded-lg p-4 text-white focus:ring-1 focus:ring-soft-pink/40 outline-none transition-all placeholder:text-white/20"
                      placeholder={discountType === "NOMINAL" ? "50000" : "15"}
                      type="number"
                      min="1"
                      max={discountType === "PERCENTAGE" ? "100" : undefined}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/60 mb-2">
                      Limit Kuota
                    </label>
                    <input
                      className="w-full bg-charcoal border border-white/10 rounded-lg p-4 text-white focus:ring-1 focus:ring-soft-pink/40 outline-none transition-all placeholder:text-white/20"
                      placeholder="500"
                      type="number"
                      min="1"
                      value={quota}
                      onChange={(e) => setQuota(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/60 mb-2">
                    Pilih Event
                  </label>
                  <select
                    className="w-full bg-charcoal border border-white/10 rounded-lg p-4 text-white focus:ring-1 focus:ring-soft-pink/40 outline-none transition-all cursor-pointer"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    required
                  >
                    {events.length === 0 ? (
                      <option value="" disabled>
                        Belum ada event...
                      </option>
                    ) : (
                      events.map((ev) => (
                        <option
                          key={ev.id}
                          value={ev.id}
                          className="bg-dark-gray"
                        >
                          {ev.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/60 mb-2">
                      Mulai
                    </label>
                    <input
                      className="w-full bg-charcoal border border-white/10 rounded-lg p-4 text-white focus:ring-1 focus:ring-soft-pink/40 outline-none transition-all"
                      type="date"
                      style={{ colorScheme: "dark" }}
                      value={validFrom}
                      onChange={(e) => setValidFrom(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/60 mb-2">
                      Berakhir
                    </label>
                    <input
                      className="w-full bg-charcoal border border-white/10 rounded-lg p-4 text-white focus:ring-1 focus:ring-soft-pink/40 outline-none transition-all"
                      type="date"
                      style={{ colorScheme: "dark" }}
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || events.length === 0}
                  className="w-full py-4 stage-gradient text-charcoal font-bold rounded-lg uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-soft-pink/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Menerbitkan..." : "Terbitkan Voucher"}
                </button>
              </form>
            </div>

            {/* Status Insights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-gray p-6 rounded-xl border border-white/5 border-l-2 border-l-soft-pink shadow-md">
                <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">
                  Voucher Aktif
                </span>
                <div className="text-3xl font-black font-headline text-soft-pink mt-1">
                  {activeVouchersCount}
                </div>
              </div>
              <div className="bg-dark-gray p-6 rounded-xl border border-white/5 border-l-2 border-l-soft-pink shadow-md">
                <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">
                  Total Promo
                </span>
                <div className="text-3xl font-black font-headline text-soft-pink mt-1">
                  {promotions.length}
                </div>
              </div>
            </div>
          </section>

          {/* Active Vouchers Grid */}
          <section className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white/60">
                Daftar Voucher Anda
              </h2>
            </div>

            {promotions.length === 0 ? (
              <div className="w-full h-64 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-white/40">
                <span className="material-symbols-outlined text-4xl mb-2">
                  local_offer
                </span>
                <p>Belum ada promo yang diterbitkan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {promotions.map((promo) => {
                  const active = isPromoActive(promo.valid_until, promo.quota);
                  const imageUrl = promo.event?.image_url
                    ? promo.event.image_url.startsWith("http")
                      ? promo.event.image_url
                      : `http://localhost:8000${promo.event.image_url}`
                    : "https://images.unsplash.com/photo-1540039155732-684735035727?auto=format&fit=crop&q=80&w=400";

                  return (
                    <div
                      key={promo.id}
                      className="group relative bg-dark-gray border border-white/5 rounded-xl overflow-hidden transition-all hover:-translate-y-1 shadow-lg hover:shadow-soft-pink/10"
                    >
                      <div className="h-32 w-full bg-charcoal relative overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={promo.event?.title}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity ${active ? "opacity-40 group-hover:opacity-60" : "opacity-10 grayscale"}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-gray to-transparent"></div>
                      </div>
                      <div className="p-6 relative">
                        <div
                          className={`absolute -top-6 right-6 px-3 py-1 rounded-full text-xs font-black italic shadow-lg ${active ? "bg-soft-pink text-charcoal shadow-soft-pink/30" : "bg-charcoal text-white/40 border border-white/20"}`}
                        >
                          {active ? "AKTIF" : "NONAKTIF"}
                        </div>
                        <h3 className="text-xl font-bold font-headline mb-1">
                          {promo.promo_code}
                        </h3>
                        <p className="text-xs text-white/60 mb-4 uppercase tracking-tighter truncate">
                          Potongan{" "}
                          {formatDiscount(
                            promo.discount_value,
                            promo.discount_type,
                          )}{" "}
                          • {promo.event?.title || "Unknown Event"}
                        </p>
                        <div className="flex justify-between items-end">
                          <div className="space-y-1 w-full max-w-[150px]">
                            <span className="text-[10px] uppercase font-bold text-soft-pink/80">
                              Sisa Kuota
                            </span>
                            <div className="w-full h-1.5 bg-charcoal border border-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${active ? "bg-soft-pink" : "bg-white/20"}`}
                                style={{
                                  width: `${Math.min(100, (promo.quota / 100) * 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-white/60 block">
                              {promo.quota} Voucher Tersedia
                            </span>
                          </div>
                          <span className="material-symbols-outlined text-white/40 hover:text-soft-pink cursor-pointer transition-colors">
                            info
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
