import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function TicketPurchase() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [_user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // State UI & Form Promo Organizer
  const [_activeTab, _setActiveTab] = useState("tiket");
  const [promoCode, setPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [discountInfo, setDiscountInfo] = useState<{
    value: number;
    type: string;
  } | null>(null);

  // (Idealnya data ini di-fetch dari API /api/users/profile milik pembeli)
  // 👇 STATE ASLI UNTUK KUPON REFERRAL & POIN 👇
  const [hasCoupon, setHasCoupon] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(0);

  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState<number | "">("");

  // State Tiket Dinamis: { ticketId: quantity }
  const [selectedTickets, setSelectedTickets] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      navigate("/login");
      return;
    }
    const userData = JSON.parse(userString);
    if (String(userData.role || "").toLowerCase() === "organizer") {
      navigate("/dashboard");
      return;
    }
    setUser(userData);

    const fetchEvent = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/events/${id}`);
        if (response.ok) {
          const data = await response.json();
          setEventData(data);
          const initialSelection: Record<number, number> = {};
          data.tickets?.forEach((t: any) => {
            initialSelection[t.id] = 0;
          });
          setSelectedTickets(initialSelection);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false); // Mematikan loading screen saat data event selesai ditarik
      }
    };

    // FUNGSI BARU: Mengambil data poin & kupon dari backend
    const fetchRewards = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:8000/api/transactions/rewards",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setAvailablePoints(data.points);
          setHasCoupon(data.hasCoupon);
        }
      } catch (error) {
        console.error("Gagal mengambil data reward:", error);
      }
    };

    //  Panggil KEDUA fungsinya di sini jika ID event tersedia
    if (id) {
      fetchEvent();
      fetchRewards();
    }
  }, [id, navigate]);

  const handleTicketChange = (
    ticketId: number,
    delta: number,
    maxAvailable: number,
  ) => {
    setSelectedTickets((prev) => {
      const currentQty = prev[ticketId] || 0;
      const newQty = currentQty + delta;
      if (newQty < 0 || newQty > 4 || newQty > maxAvailable) return prev;
      return { ...prev, [ticketId]: newQty };
    });
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoMessage("Memeriksa kode promo...");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8000/api/transactions/validate-promo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ promoCode, eventId: id }),
        },
      );
      const result = await response.json();
      if (response.ok) {
        setIsPromoApplied(true);
        setDiscountInfo({
          value: result.data.discount_value,
          type: result.data.discount_type,
        });
        setPromoMessage("Kode promo berhasil digunakan!");
      } else {
        setIsPromoApplied(false);
        setDiscountInfo(null);
        setPromoMessage(result.message);
      }
    } catch (error) {
      setPromoMessage("Gagal memvalidasi promo jaringan.");
    }
  };

  useEffect(() => {
    if (promoCode === "") {
      setIsPromoApplied(false);
      setDiscountInfo(null);
      setPromoMessage("");
    }
  }, [promoCode]);

  // === KALKULASI HARGA REAL-TIME (DISKON BERLAPIS) ===
  let subTotal = 0;
  if (eventData?.tickets) {
    eventData.tickets.forEach((t: any) => {
      subTotal += t.price * (selectedTickets[t.id] || 0);
    });
  }

  // 1. Diskon Promo Organizer
  let promoDiscountNominal = 0;
  if (isPromoApplied && discountInfo && subTotal > 0) {
    if (discountInfo.type === "PERCENTAGE") {
      promoDiscountNominal = subTotal * (discountInfo.value / 100);
    } else {
      promoDiscountNominal = discountInfo.value;
    }
  }
  if (promoDiscountNominal > subTotal) promoDiscountNominal = subTotal;

  let priceAfterPromo = subTotal - promoDiscountNominal;

  // 2. Diskon Kupon Referral (10%)
  let couponDiscountNominal = 0;
  if (isCouponApplied && priceAfterPromo > 0) {
    couponDiscountNominal = priceAfterPromo * 0.1; // Potong 10%
  }
  let priceAfterCoupon = priceAfterPromo - couponDiscountNominal;

  // 3. Pajak & Layanan (Diasumsikan dihitung dari harga setelah promo/kupon)
  const serviceFee = subTotal > 0 ? 25000 : 0;
  const tax = priceAfterCoupon * 0.11;
  let totalBeforePoints = priceAfterCoupon + serviceFee + tax;

  // 4. Potongan Poin (1 Poin = Rp 1)
  let pointsDiscountNominal = 0;
  const redeemVal = Number(pointsToRedeem) || 0;
  if (redeemVal > 0) {
    // Poin tidak bisa memotong lebih dari total harga
    pointsDiscountNominal = Math.min(totalBeforePoints, redeemVal);
  }

  // Total Akhir
  const total = totalBeforePoints - pointsDiscountNominal;

  // === PROSES CHECKOUT ===
  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const ticketsToBuy = Object.entries(selectedTickets)
        .filter(([_, qty]) => qty > 0)
        .map(([ticketId, qty]) => ({
          ticketId: Number(ticketId),
          quantity: qty,
        }));

      const response = await fetch(
        "http://localhost:8000/api/transactions/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventId: id,
            selectedTickets: ticketsToBuy,
            promoCode: isPromoApplied ? promoCode : null,
            useCoupon: isCouponApplied, // 👈 Kirim status kupon
            redeemPoints: Number(pointsToRedeem) || 0, // 👈 Kirim jumlah poin
          }),
        },
      );

      const result = await response.json();
      if (response.ok) {
        alert("🎉 Pembelian Berhasil! Cek email Anda untuk E-Ticket.");
        navigate("/");
      } else {
        alert("Gagal: " + result.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !eventData) {
    return (
      <div className="min-h-screen bg-charcoal flex justify-center items-center text-soft-pink font-bold animate-pulse text-2xl">
        MEMPERSIAPKAN TIKET...
      </div>
    );
  }

  return (
    <div className="dark bg-charcoal font-body text-white min-h-screen selection:bg-soft-pink selection:text-charcoal pb-24 md:pb-0">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-charcoal/80 backdrop-blur-xl shadow-[0px_10px_30px_rgba(0,0,0,0.3)] border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-screen-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-soft-pink hover:text-light-pink"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-2xl font-black text-soft-pink tracking-widest font-headline italic uppercase">
            NEON STAGE
          </h1>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="pt-20 pb-12 px-6 max-w-screen-xl mx-auto space-y-12">
        {/* Section 1: Event Header */}
        <section className="relative rounded-2xl overflow-hidden bg-dark-gray min-h-[250px] flex items-end border border-white/5 shadow-2xl mt-6">
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            alt="Event"
            src={
              eventData.image_url ||
              "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80"
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent"></div>
          <div className="relative p-6 md:p-10 w-full">
            <span className="inline-block px-3 py-1 bg-soft-pink text-charcoal text-[10px] font-bold tracking-[0.2em] rounded-full uppercase mb-4 shadow-[0_0_15px_rgba(255,143,199,0.4)]">
              {eventData.category}
            </span>
            <h2 className="text-4xl md:text-5xl font-black font-headline text-white tracking-tighter leading-none mb-4 italic uppercase">
              {eventData.title}
            </h2>
            <p className="text-white/80 font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-soft-pink text-sm">
                location_on
              </span>
              {eventData.location}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column (Tiket Selection) */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="text-3xl font-black font-headline tracking-tight uppercase text-white">
              Pilih Kategori Tiket
            </h2>
            <div className="space-y-4">
              {eventData.tickets?.map((ticket: any) => {
                const isSoldOut = ticket.available_seats <= 0;
                const qty = selectedTickets[ticket.id] || 0;
                return (
                  <div
                    key={ticket.id}
                    className={`group border border-white/5 rounded-xl p-6 transition-all shadow-lg ${isSoldOut ? "bg-dark-gray/50 opacity-60" : "bg-dark-gray hover:border-soft-pink/30 hover:bg-charcoal"}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold font-headline text-white uppercase">
                          {ticket.name}
                        </h4>
                        <p className="text-xs text-white/40 font-semibold tracking-widest uppercase">
                          Sisa: {ticket.available_seats} Kursi
                        </p>
                        <p className="text-xl font-black text-soft-pink mt-2">
                          Rp {ticket.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      {!isSoldOut ? (
                        <div className="flex items-center bg-charcoal rounded-lg p-1 border border-white/10 self-start sm:self-auto">
                          <button
                            onClick={() =>
                              handleTicketChange(
                                ticket.id,
                                -1,
                                ticket.available_seats,
                              )
                            }
                            className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white"
                          >
                            <span className="material-symbols-outlined">
                              remove
                            </span>
                          </button>
                          <span className="w-12 text-center font-bold text-white">
                            {qty}
                          </span>
                          <button
                            onClick={() =>
                              handleTicketChange(
                                ticket.id,
                                1,
                                ticket.available_seats,
                              )
                            }
                            className="w-10 h-10 flex items-center justify-center bg-charcoal text-white hover:text-soft-pink hover:border-soft-pink border border-transparent rounded-md"
                          >
                            <span className="material-symbols-outlined">
                              add
                            </span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-red-400 font-bold uppercase italic border border-red-500/30 px-4 py-2 rounded-lg bg-red-500/10">
                          Habis
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              {/* Voucher Event Input */}
              <div className="bg-dark-gray rounded-xl p-6 border border-white/5 shadow-xl">
                <h4 className="text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2 text-white">
                  <span className="material-symbols-outlined text-soft-pink text-lg">
                    confirmation_number
                  </span>{" "}
                  Kode Promo Event
                </h4>
                <div className="flex gap-2">
                  <input
                    className="flex-grow bg-charcoal border border-white/10 rounded-lg py-3 px-4 text-white uppercase focus:border-soft-pink outline-none"
                    placeholder="Masukkan Kode"
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="bg-charcoal border border-white/10 hover:border-soft-pink hover:text-soft-pink px-6 rounded-lg text-white font-bold transition-all"
                  >
                    Pakai
                  </button>
                </div>
                {promoMessage && (
                  <p
                    className={`text-xs mt-3 ${isPromoApplied ? "text-green-400" : "text-soft-pink"}`}
                  >
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* 👇 REWARD & POIN INPUT 👇 */}
              <div className="bg-dark-gray rounded-xl p-6 border border-white/5 shadow-xl">
                <h4 className="text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2 text-white">
                  <span className="material-symbols-outlined text-yellow-400 text-lg">
                    stars
                  </span>{" "}
                  Reward & Poin
                </h4>

                {/* Toggle Kupon Referral */}
                {hasCoupon && (
                  <div className="mb-5 flex items-center justify-between p-3 bg-charcoal border border-white/10 rounded-lg">
                    <div>
                      <p className="text-sm font-bold text-white">
                        Kupon Referral 10%
                      </p>
                      <p className="text-[10px] text-white/40">
                        Gunakan kupon dari pendaftaran
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isCouponApplied}
                        onChange={(e) => setIsCouponApplied(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-dark-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/60 after:border-white/60 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-soft-pink peer-checked:after:bg-charcoal"></div>
                    </label>
                  </div>
                )}

                {/* Input Tukar Poin */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-sm font-bold text-white">Gunakan Poin</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                      Saldo: {availablePoints}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-grow bg-charcoal border border-white/10 rounded-lg py-2 px-4 text-white focus:border-soft-pink outline-none text-sm"
                      placeholder="Jumlah poin..."
                      type="number"
                      max={availablePoints}
                      value={pointsToRedeem}
                      onChange={(e) => {
                        let val = parseInt(e.target.value);
                        if (isNaN(val)) setPointsToRedeem("");
                        else if (val > availablePoints)
                          setPointsToRedeem(availablePoints);
                        else setPointsToRedeem(val);
                      }}
                    />
                    <button
                      onClick={() => setPointsToRedeem(availablePoints)}
                      className="text-xs bg-white/5 border border-white/10 hover:border-soft-pink text-white px-4 rounded-lg transition-all font-bold"
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-dark-gray rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 border border-white/5">
                <h4 className="text-xl font-bold font-headline text-white">
                  Ringkasan Pesanan
                </h4>

                {subTotal === 0 ? (
                  <div className="text-white/40 text-center py-6 text-sm">
                    Belum ada tiket yang dipilih.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventData.tickets?.map((t: any) => {
                      const qty = selectedTickets[t.id];
                      if (qty > 0) {
                        return (
                          <div
                            key={t.id}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-white/70">
                              {qty}x {t.name}
                            </span>
                            <span className="font-semibold text-white">
                              Rp {(qty * t.price).toLocaleString("id-ID")}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })}

                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40">Biaya Layanan</span>
                        <span className="font-semibold text-white/80">
                          Rp {serviceFee.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40">Pajak (11%)</span>
                        <span className="font-semibold text-white/80">
                          Rp {tax.toLocaleString("id-ID")}
                        </span>
                      </div>

                      {/* Baris Diskon Promo */}
                      {isPromoApplied && promoDiscountNominal > 0 && (
                        <div className="flex justify-between items-center text-xs text-green-400 font-bold">
                          <span>Promo ({promoCode})</span>
                          <span>
                            - Rp {promoDiscountNominal.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}

                      {/* Baris Diskon Kupon */}
                      {isCouponApplied && couponDiscountNominal > 0 && (
                        <div className="flex justify-between items-center text-xs text-green-400 font-bold">
                          <span>Kupon Referral (10%)</span>
                          <span>
                            - Rp {couponDiscountNominal.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}

                      {/* Baris Diskon Poin */}
                      {pointsDiscountNominal > 0 && (
                        <div className="flex justify-between items-center text-xs text-yellow-400 font-bold">
                          <span>Tukar Poin</span>
                          <span>
                            - Rp {pointsDiscountNominal.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-white/10">
                  <div className="flex justify-between items-end mb-8">
                    <span className="text-sm font-bold tracking-widest uppercase text-white/60">
                      Total Bayar
                    </span>
                    <span className="text-3xl font-black text-soft-pink tracking-tighter">
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={subTotal === 0 || isProcessing}
                    className={`w-full py-4 rounded-xl font-black text-lg tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 ${
                      subTotal > 0 && !isProcessing
                        ? "stage-gradient text-charcoal shadow-[0_0_20px_rgba(255,143,199,0.3)] hover:brightness-110 active:scale-95"
                        : "bg-charcoal text-white/20 cursor-not-allowed border border-white/5"
                    }`}
                  >
                    <span>
                      {isProcessing ? "Memproses..." : "Bayar Sekarang"}
                    </span>
                    <span className="material-symbols-outlined font-bold">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
