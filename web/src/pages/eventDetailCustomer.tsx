import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function EventDetailCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState<any>(null);
  const [organizerReviews, setOrganizerReviews] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Detail Event
    const fetchEventDetail = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/events/${id}`);
        if (response.ok) {
          const data = await response.json();
          setEventData(data);

          // 2. Jika event ketemu, ambil ID Organizer-nya, lalu Fetch Ulasannya
          if (data.organizer_id) {
            fetchReviews(data.organizer_id);
          } else {
            setIsLoading(false);
          }
        } else {
          navigate("/"); // Lempar ke home jika event tidak ada
        }
      } catch (error) {
        console.error("Gagal memuat event:", error);
        setIsLoading(false);
      }
    };

    // 3. Fungsi Fetch Ulasan Organizer
    const fetchReviews = async (organizerId: number) => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/reviews/organizer/${organizerId}`,
        );
        if (response.ok) {
          const result = await response.json();
          setOrganizerReviews(result.data);
        }
      } catch (error) {
        console.error("Gagal memuat ulasan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetail();
  }, [id, navigate]);

  // Helper Format
  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (time: string) =>
    new Date(time).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Render Bintang
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`material-symbols-outlined text-sm ${star <= rating ? "text-yellow-400" : "text-white/10"}`}
            style={{
              fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            star
          </span>
        ))}
      </div>
    );
  };

  if (isLoading || !eventData) {
    return (
      <div className="min-h-screen bg-charcoal flex justify-center items-center text-soft-pink font-bold animate-pulse text-2xl tracking-widest">
        MEMUAT STAGE...
      </div>
    );
  }

  // Cek apakah ada tiket tersedia
  const isAvailable = eventData.tickets?.some(
    (t: any) => t.available_seats > 0,
  );

  return (
    <div className="dark bg-charcoal font-body text-white min-h-screen selection:bg-soft-pink selection:text-charcoal pb-24 md:pb-0">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-charcoal/80 backdrop-blur-[20px] shadow-lg border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-screen-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-soft-pink hover:text-light-pink transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-2xl font-black text-soft-pink tracking-widest font-headline italic uppercase">
            NEON STAGE
          </h1>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="pt-20 pb-12 px-6 max-w-5xl mx-auto space-y-12">
        {/* SECTION 1: POSTER & HERO */}
        <section className="relative rounded-3xl overflow-hidden bg-dark-gray min-h-[400px] flex items-end border border-white/5 shadow-2xl mt-6">
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-50 hover:opacity-60 transition-opacity duration-700"
            alt={eventData.title}
            src={
              eventData.image_url ||
              "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80"
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent"></div>
          <div className="relative p-8 md:p-12 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 bg-soft-pink text-charcoal text-[10px] font-bold tracking-[0.2em] rounded-full uppercase mb-4">
                {eventData.category || "Event"}
              </span>
              <h2 className="text-4xl md:text-6xl font-black font-headline text-white tracking-tighter leading-none mb-4 italic uppercase">
                {eventData.title}
              </h2>
              <div className="flex flex-wrap items-center gap-6 text-white/80 font-medium text-sm">
                <p className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-soft-pink">
                    calendar_today
                  </span>
                  {formatDate(eventData.event_date)} •{" "}
                  {formatTime(eventData.event_time)} WIB
                </p>
                <p className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-soft-pink">
                    location_on
                  </span>
                  {eventData.location}
                </p>
              </div>
            </div>

            <div className="md:text-right shrink-0">
              <p className="text-xs text-white/60 uppercase tracking-widest mb-2 font-bold">
                Harga Tiket Mulai Dari
              </p>
              <p className="text-3xl font-black text-soft-pink mb-4">
                {eventData.tickets?.length > 0
                  ? formatRupiah(
                      Math.min(...eventData.tickets.map((t: any) => t.price)),
                    )
                  : "TBA"}
              </p>
              <Link
                to={`/checkout/${eventData.id}`}
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${
                  isAvailable
                    ? "stage-gradient text-charcoal shadow-[0_0_20px_rgba(255,143,199,0.3)] hover:brightness-110 active:scale-95"
                    : "bg-dark-gray text-white/40 border border-white/10 cursor-not-allowed pointer-events-none"
                }`}
              >
                {isAvailable ? "Beli Tiket" : "Tiket Habis"}
                <span className="material-symbols-outlined text-sm">
                  local_activity
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 2: DESKRIPSI & TIKET */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-8 space-y-10">
            <div className="space-y-4">
              <h3 className="text-2xl font-headline font-black uppercase italic tracking-tighter text-white">
                Deskripsi Event
              </h3>
              <div className="w-16 h-1 bg-soft-pink rounded-full"></div>
              <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                {eventData.description ||
                  "Belum ada deskripsi untuk event ini."}
              </p>
            </div>

            {/* 🔴 SECTION 3: ULASAN PENYELENGGARA 🔴 */}
            <div className="space-y-6 pt-10 border-t border-white/5">
              <h3 className="text-2xl font-headline font-black uppercase italic tracking-tighter text-white">
                Tentang Penyelenggara
              </h3>
              <div className="w-16 h-1 bg-soft-pink rounded-full mb-6"></div>

              {organizerReviews && (
                <div className="bg-dark-gray border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                  {/* 👇 NAMA PENYELENGGARA DITAMBAHKAN DI SINI 👇 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-6 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-charcoal border border-soft-pink/30 flex items-center justify-center font-black text-soft-pink text-xl shadow-lg">
                        {eventData.users?.name?.charAt(0).toUpperCase() || "O"}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold font-headline text-white tracking-wider">
                          {eventData.users?.name || "Nama Organizer"}
                        </h4>
                        <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
                          Penyelenggara Event
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:border-l border-white/10 sm:pl-6">
                      <div className="text-center sm:text-right">
                        <p className="text-4xl font-black text-yellow-400 font-headline leading-none">
                          {organizerReviews.average_rating}
                        </p>
                        <div className="flex gap-1 justify-center sm:justify-end mt-1 text-yellow-400">
                          <span
                            className="material-symbols-outlined text-sm"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-[10px] text-white/60 uppercase tracking-widest">
                          Total Ulasan
                        </p>
                        <p className="text-sm font-bold text-white">
                          {organizerReviews.total_reviews} Reviewer
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* List of Reviews */}
                  {organizerReviews.reviews.length === 0 ? (
                    <p className="text-white/40 italic text-sm text-center pt-4">
                      Belum ada ulasan untuk penyelenggara ini.
                    </p>
                  ) : (
                    <div className="space-y-4 pt-2">
                      {organizerReviews.reviews.map((rev: any) => (
                        <div
                          key={rev.id}
                          className="bg-charcoal border border-white/5 rounded-xl p-5 hover:border-soft-pink/20 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-dark-gray border border-white/10 flex items-center justify-center font-bold text-soft-pink text-xs">
                                {rev.user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-white">
                                  {rev.user.name}
                                </p>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">
                                  {new Date(rev.created_at).toLocaleDateString(
                                    "id-ID",
                                  )}
                                </p>
                              </div>
                            </div>
                            {renderStars(rev.rating)}
                          </div>
                          <p className="text-sm text-white/80 leading-relaxed italic">
                            "{rev.feedback}"
                          </p>
                          <p className="text-[10px] text-soft-pink/60 mt-3 font-bold uppercase tracking-widest border-t border-white/5 pt-2">
                            Event: {rev.event.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* KANAN: DAFTAR KATEGORI TIKET */}
          <div className="md:col-span-4 space-y-6 sticky top-28">
            <h3 className="text-xl font-headline font-black uppercase italic tracking-tighter text-white">
              Kategori Tiket
            </h3>

            <div className="space-y-4">
              {eventData.tickets?.map((ticket: any) => (
                <div
                  key={ticket.id}
                  className="bg-dark-gray border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden"
                >
                  {ticket.available_seats <= 0 && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase rounded border border-red-500/20">
                      Habis
                    </div>
                  )}
                  <h4 className="font-bold text-white uppercase text-sm mb-1">
                    {ticket.name}
                  </h4>
                  <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase mb-3">
                    Sisa: {ticket.available_seats} Kursi
                  </p>
                  <p className="text-lg font-black text-soft-pink">
                    {formatRupiah(ticket.price)}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-charcoal border border-soft-pink/20 rounded-xl p-5 text-center mt-6">
              <span className="material-symbols-outlined text-soft-pink text-3xl mb-2">
                security
              </span>
              <p className="text-xs text-white/60 leading-relaxed">
                Pembelian Anda dilindungi oleh sistem keamanan{" "}
                <span className="font-bold text-white">Neon Stage</span>. Tiket
                palsu = 100% Uang Kembali.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
