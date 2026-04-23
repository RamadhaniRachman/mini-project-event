import { useEffect, useState } from "react";

export default function Attendees() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk filter data
  const [activeFilter, setActiveFilter] = useState("Semua Peserta");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [searchQuery, setSearchQuery] = useState("");

  // Cek Akses & Ambil Data Peserta
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      window.location.href = "/login";
      return;
    }

    const userData = JSON.parse(userString);
    if (String(userData.role || "").toLowerCase() !== "organizer") {
      window.location.href = "/";
      return;
    }
    setUser(userData);

    // Fetch data peserta dari Backend
    const fetchAttendees = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/events/attendees",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.ok) {
          const result = await response.json();
          setAttendees(result.data || []);
        }
      } catch (error) {
        console.error("Gagal mengambil data peserta:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendees();
  }, []);

  // Filter Data Berdasarkan Pencarian
  const filteredAttendees = attendees.filter((item) => {
    const matchSearch =
      item.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-[80vh] text-soft-pink font-headline font-bold text-xl tracking-widest animate-pulse">
        MEMUAT DATA PESERTA...
      </div>
    );
  }

  const filters = ["Semua Peserta", "VIP", "Reguler"];

  // 🔴 PERUBAHAN: Dihapus sidebar <aside> dan class margin md:ml-64
  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-24 md:pb-12 text-white">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-white">
            DAFTAR <span className="text-soft-pink">PESERTA</span>
          </h2>
          <p className="text-white/60 text-sm mt-1">
            Kelola data pembeli tiket dari seluruh event Anda.
          </p>
        </div>

        {/* Kolom Pencarian */}
        <div className="relative w-full max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
            search
          </span>
          <input
            className="w-full bg-dark-gray border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:ring-1 focus:border-soft-pink focus:ring-soft-pink/30 placeholder:text-white/40 outline-none transition-all"
            placeholder="Cari nama atau email..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex gap-2 items-center overflow-x-auto pb-2 md:pb-0 w-full md:w-auto custom-scrollbar">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                activeFilter === filter
                  ? "bg-soft-pink text-charcoal border-soft-pink font-bold"
                  : "bg-dark-gray text-white/60 hover:text-white border-white/10 hover:border-white/30"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-white/60 text-sm font-medium whitespace-nowrap">
            Status:
          </label>
          <select
            className="bg-dark-gray border border-white/10 rounded-lg text-sm text-white focus:ring-1 focus:ring-soft-pink/40 py-2 pl-4 pr-10 outline-none w-full md:w-auto cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option className="bg-charcoal" value="Semua Status">
              Semua Status
            </option>
            <option className="bg-charcoal" value="Checked-in">
              Checked-in
            </option>
            <option className="bg-charcoal" value="Registered">
              Registered
            </option>
          </select>
        </div>
      </div>

      {/* Tabel Peserta */}
      <div className="bg-dark-gray rounded-2xl overflow-hidden shadow-2xl border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-charcoal/50 border-b border-white/10">
                <th className="px-6 py-5 text-xs font-label uppercase tracking-widest text-white/60">
                  No
                </th>
                <th className="px-6 py-5 text-xs font-label uppercase tracking-widest text-white/60">
                  Nama Lengkap
                </th>
                <th className="px-6 py-5 text-xs font-label uppercase tracking-widest text-white/60">
                  Email
                </th>
                <th className="px-6 py-5 text-xs font-label uppercase tracking-widest text-white/60">
                  Nama Event
                </th>
                <th className="px-6 py-5 text-xs font-label uppercase tracking-widest text-white/60">
                  Kategori Tiket
                </th>
                <th className="px-6 py-5 text-xs font-label uppercase tracking-widest text-white/60 text-center">
                  Qty
                </th>
                <th className="px-6 py-5 text-xs font-label uppercase tracking-widest text-white/60">
                  Total Bayar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-white/40 italic"
                  >
                    Belum ada data peserta yang cocok.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-charcoal transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm text-white/60">
                      {(index + 1).toString().padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-soft-pink/20 flex items-center justify-center text-soft-pink text-xs font-bold border border-soft-pink/10">
                          {item.user?.name?.substring(0, 2).toUpperCase() ||
                            "NN"}
                        </div>
                        <span className="text-sm font-semibold text-white whitespace-nowrap">
                          {item.user?.name || "Anonim"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60 whitespace-nowrap">
                      {item.user?.email || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/80 whitespace-nowrap truncate max-w-[150px]">
                      {item.event?.title || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-white/5 text-white/80 rounded-full text-[10px] font-black uppercase tracking-tighter border border-white/10">
                        {item.ticket_type?.name || "-"}{" "}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white text-center font-medium">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-soft-pink whitespace-nowrap">
                      Rp {item.final_price?.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        <div className="px-6 py-4 bg-charcoal/30 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/60">
            Menampilkan {filteredAttendees.length} peserta dari total{" "}
            {attendees.length}
          </p>
          {/* Tombol pagination dummy bisa ditaruh di sini jika nanti dibutuhkan */}
        </div>
      </div>
    </div>
  );
}
