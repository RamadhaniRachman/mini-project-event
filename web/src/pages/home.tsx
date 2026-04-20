import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  // ================= STATE =================
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const categories = ["ALL", "MUSIC", "TECH", "FOOD", "ART"];

  // ================= EFFECT =================
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchEvents();
  }, [debounced, category, page]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3000/api/events?search=${debounced}&category=${category}&page=${page}`,
      );
      const data = await res.json();
      setEvents(data.data || []);
    } catch (err) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= RENDER =================
  return (
    <div className="bg-charcoal min-h-screen text-white font-body">
      <Navbar />

      <main className="pt-28 px-6 md:px-12">
        <Hero search={search} setSearch={setSearch} />

        <CategoryFilter
          categories={categories}
          active={category}
          onChange={(cat: string) => {
            setCategory(cat === "ALL" ? "" : cat);
            setPage(1);
          }}
        />

        <EventSection
          loading={loading}
          events={events}
          onClick={(id: number) => navigate(`/events/${id}`)}
        />

        <Pagination page={page} setPage={setPage} />
      </main>
    </div>
  );
}

//
// ================= COMPONENTS =================
//

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-charcoal/80 backdrop-blur-xl px-8 py-4 flex justify-between items-center">
      <h1 className="font-headline text-lg text-soft-pink">
        The Nocturne Circuit
      </h1>

      <div className="hidden md:flex gap-6 text-sm">
        <span className="text-soft-pink border-b">Discover</span>
        <span className="opacity-70 hover:text-soft-pink">Schedule</span>
        <span className="opacity-70 hover:text-soft-pink">Referrals</span>
      </div>
    </nav>
  );
}

function Hero({ search, setSearch }: any) {
  return (
    <section className="text-center mb-16">
      <h1 className="font-headline text-5xl md:text-7xl font-extrabold">
        THE STAGE <br />
        <span className="text-soft-pink italic">IS YOURS</span>
      </h1>

      <div className="mt-8 flex justify-center">
        <div className="flex items-center bg-dark-gray px-6 py-4 rounded-full w-full max-w-2xl">
          <span className="material-symbols-outlined mr-3">search</span>
          <input
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="bg-transparent outline-none w-full"
          />
        </div>
      </div>
    </section>
  );
}

function CategoryFilter({ categories, active, onChange }: any) {
  return (
    <section className="flex flex-wrap gap-3 mb-12 justify-center">
      {categories.map((cat: string) => {
        const isActive = active === cat || (cat === "ALL" && active === "");

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition
              ${
                isActive
                  ? "stage-gradient text-black"
                  : "bg-dark-gray hover:bg-gray-700"
              }`}
          >
            {cat}
          </button>
        );
      })}
    </section>
  );
}

function EventSection({ loading, events, onClick }: any) {
  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (events.length === 0) {
    return <p className="text-center opacity-60">No events found</p>;
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event: any) => (
        <EventCard key={event.id} event={event} onClick={onClick} />
      ))}
    </section>
  );
}

function EventCard({ event, onClick }: any) {
  return (
    <div
      onClick={() => onClick(event.id)}
      className="group bg-dark-gray rounded-3xl overflow-hidden cursor-pointer
                 transition hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,143,199,0.2)]"
    >
      {/* IMAGE */}
      <div className="relative h-60 overflow-hidden">
        <img
          src={event.image_url || "https://via.placeholder.com/400"}
          className="w-full h-full object-cover transition group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute top-4 right-4 text-xs text-soft-pink font-bold">
          {new Date(event.event_date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <h3 className="font-headline text-lg group-hover:text-soft-pink transition">
          {event.title}
        </h3>

        <p className="text-sm opacity-60 mb-3">{event.location}</p>

        <div className="flex justify-between items-center">
          <p className="font-bold text-soft-pink">
            {event.is_free
              ? "FREE"
              : `Rp ${event.price?.toLocaleString("id-ID")}`}
          </p>

          <div className="p-2 rounded-full bg-charcoal group-hover:stage-gradient transition">
            →
          </div>
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, setPage }: any) {
  return (
    <section className="flex justify-center mt-16 gap-2">
      {[1, 2, 3].map((num) => (
        <button
          key={num}
          onClick={() => setPage(num)}
          className={`w-10 h-10 rounded-full font-bold
            ${page === num ? "stage-gradient text-black" : "bg-dark-gray"}`}
        >
          {num}
        </button>
      ))}
    </section>
  );
}
