import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EventDetail() {
  const API_URL = import.meta.env.VITE_PROJECT_API;

  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State Form Event
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventCategory, setEventCategory] = useState("K-Pop Concert");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [isDirectSaleActive, _setIsDirectSaleActive] = useState(true);

  // State File Gambar & Preview
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    "https://images.unsplash.com/photo-1540039155732-684735035727?auto=format&fit=crop&q=80&w=400",
  );

  // State Tiket Dinamis
  const [tickets, setTickets] = useState([
    { id: "", name: "VIP Standing", price: 3400000, available_seats: 1500 },
  ]);

  // Cek Akses & Fetch Data
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

    const fetchEventDetail = async () => {
      try {
        const response = await fetch(`${API_URL}/api/events/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setEventName(data.title || "");
          setEventLocation(data.location || "");
          setEventDescription(data.description || "");
          setEventCategory(data.category || "K-Pop Concert");

          if (data.event_date) {
            // Potong ambil YYYY-MM-DD nya saja
            const datePart = new Date(data.event_date)
              .toISOString()
              .split("T")[0];

            // Potong ambil HH:mm nya saja
            let timePart = "00:00";
            if (data.event_time) {
              timePart = new Date(data.event_time)
                .toISOString()
                .split("T")[1]
                .substring(0, 5);
            }

            // Hasil gabungan yang bersih: "2026-05-08T13:44"
            setEventDate(`${datePart}T${timePart}`);
          }
          if (data.image_url) setImagePreview(data.image_url);
          if (data.tickets && data.tickets.length > 0) setTickets(data.tickets);
        }
      } catch (error) {
        console.error("Gagal mengambil data event:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchEventDetail();
  }, [id, navigate]);

  // Handler Tiket
  const handleAddTicket = () => {
    setTickets([
      ...tickets,
      { id: "", name: "Kategori Baru", price: 0, available_seats: 0 },
    ]);
  };

  const handleRemoveTicket = (index: number) => {
    const newTickets = [...tickets];
    newTickets.splice(index, 1);
    setTickets(newTickets);
  };

  const handleTicketChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const newTickets = [...tickets];
    newTickets[index] = { ...newTickets[index], [field]: value };
    setTickets(newTickets);
  };

  // Handler Ganti Poster
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handler Simpan
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const submitData = new FormData();
      submitData.append("title", eventName);
      submitData.append("category", eventCategory);
      submitData.append("location", eventLocation);
      submitData.append("description", eventDescription);

      if (eventDate) {
        const [date, time] = eventDate.split("T");
        submitData.append("event_date", date);
        submitData.append("event_time", time);
      }

      submitData.append("is_direct_sale", String(isDirectSaleActive));
      submitData.append("tickets", JSON.stringify(tickets));

      if (imageFile) {
        submitData.append("image", imageFile);
      }
      const API_URL = import.meta.env.VITE_PROJECT_API;

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/events/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      if (response.ok) {
        alert("🎉 Perubahan Event Berhasil Disimpan!");
        navigate("/dashboard/events");
      } else {
        const errData = await response.json();
        alert(
          "Gagal menyimpan: " +
            (errData.message || "Periksa kembali data Anda"),
        );
      }
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-[80vh] text-soft-pink font-headline font-bold text-xl tracking-widest animate-pulse">
        MEMUAT STAGE...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-24 md:pb-12 text-white">
      <div className="space-y-10">
        {/* --- Header Section --- */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tighter font-headline text-white mb-2">
              PERBARUI <span className="text-soft-pink">VISI</span> PANGGUNG
              ANDA
            </h3>
            <p className="text-white/60 text-base max-w-xl leading-relaxed">
              Pastikan semua detail teknis dan logistik sudah akurat sebelum
              tiket mulai dijual.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/events")}
              className="px-6 py-3 text-white/60 border border-white/20 rounded-lg font-semibold hover:bg-white/5 transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 stage-gradient text-charcoal rounded-lg font-bold shadow-lg shadow-soft-pink/20 transition-transform hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </section>

        <form
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          onSubmit={handleSave}
        >
          {/* --- KOLOM KIRI (LEBIH LEBAR) --- */}
          <div className="lg:col-span-2 space-y-8">
            {/* Card 1: Informasi Dasar & Lokasi */}
            <div className="bg-dark-gray border border-white/5 rounded-2xl p-6 md:p-8 space-y-8 shadow-xl">
              <div className="space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-light-pink border-b border-white/5 pb-4">
                  Informasi Utama
                </h4>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-white/60">
                    Nama Event
                  </span>
                  <input
                    className="w-full bg-charcoal border border-white/10 rounded-lg p-4 text-white focus:border-soft-pink outline-none transition-colors"
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Contoh: Neo City Jakarta"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-white/60">
                      Tanggal & Waktu
                    </span>
                    <input
                      className="w-full bg-charcoal border border-white/10 rounded-lg p-4 text-white focus:border-soft-pink outline-none transition-colors"
                      type="datetime-local"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-white/60">
                      Kategori Event
                    </span>
                    <select
                      className="w-full bg-charcoal border border-white/10 rounded-lg p-4 text-white focus:border-soft-pink outline-none transition-colors"
                      value={eventCategory}
                      onChange={(e) => setEventCategory(e.target.value)}
                    >
                      <option className="bg-dark-gray" value="K-Pop Concert">
                        K-Pop Concert
                      </option>
                      <option className="bg-dark-gray" value="Fan Meeting">
                        Fan Meeting
                      </option>
                      <option className="bg-dark-gray" value="Music Festival">
                        Music Festival
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bagian Lokasi yang Sempat Hilang 😭 */}
              <div className="space-y-4 pt-6 border-t border-white/5">
                <label className="block text-sm font-medium text-white/60">
                  Lokasi & Venue
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-soft-pink">
                      location_on
                    </span>
                  </div>
                  <input
                    className="w-full bg-charcoal border border-white/10 rounded-lg p-4 pl-12 text-white focus:border-soft-pink outline-none transition-colors"
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Contoh: ICE BSD Hall 7-8"
                  />
                </div>
                {/* Mock Map Picker */}
                <div className="h-48 w-full bg-charcoal rounded-lg overflow-hidden relative grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all border border-white/5 cursor-pointer">
                  <img
                    alt="Map Location"
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-soft-pink text-charcoal p-2 rounded-full shadow-[0_0_15px_rgba(255,143,199,0.5)] animate-pulse">
                      <span
                        className="material-symbols-outlined block"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        location_on
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Deskripsi Event */}
            <div className="bg-dark-gray border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
              <h4 className="text-xs font-bold uppercase tracking-widest text-light-pink border-b border-white/5 pb-4">
                Detail Deskripsi
              </h4>
              <div className="bg-charcoal rounded-lg overflow-hidden border border-white/10 focus-within:border-soft-pink transition-colors">
                {/* Toolbar Mock */}
                <div className="flex items-center gap-2 p-3 bg-white/5 border-b border-white/5">
                  <button
                    type="button"
                    className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      format_bold
                    </span>
                  </button>
                  <button
                    type="button"
                    className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      format_italic
                    </span>
                  </button>
                  <button
                    type="button"
                    className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      format_list_bulleted
                    </span>
                  </button>
                </div>
                <textarea
                  className="w-full bg-transparent border-none p-4 text-white/80 focus:ring-0 leading-relaxed outline-none resize-y min-h-[200px]"
                  placeholder="Ceritakan semenarik mungkin tentang konser ini..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>

          {/* --- KOLOM KANAN (LEBIH KECIL) --- */}
          <div className="space-y-8 lg:col-span-1">
            {/* Media Upload Card */}
            <div className="bg-dark-gray border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
              <h4 className="text-xs font-bold uppercase tracking-widest text-light-pink border-b border-white/5 pb-4">
                Poster Event
              </h4>
              <div className="aspect-[3/4] w-full rounded-lg bg-charcoal border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-center p-6 relative group overflow-hidden hover:border-soft-pink transition-colors cursor-pointer">
                <img
                  alt="Poster"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-20 transition-opacity"
                  src={imagePreview}
                />
                <div className="relative z-10 space-y-2 pointer-events-none flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-soft-pink group-hover:scale-110 transition-transform">
                    cloud_upload
                  </span>
                  <p className="text-sm font-medium text-white">Ganti Poster</p>
                  <p className="text-xs text-white/40">PNG, JPG (Maks 5MB)</p>
                </div>
                <input
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* Ticket Categories Section */}
            <div className="bg-dark-gray border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-light-pink">
                  Kategori Tiket
                </h4>
                <button
                  type="button"
                  onClick={handleAddTicket}
                  className="text-soft-pink text-xs font-bold flex items-center hover:bg-soft-pink/10 px-2 py-1 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-sm mr-1">
                    add
                  </span>{" "}
                  Tambah
                </button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {tickets.map((ticket, index) => (
                  <div
                    key={index}
                    className="p-4 bg-charcoal rounded-lg space-y-4 relative group border border-white/5 hover:border-white/20 transition-colors"
                  >
                    {tickets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTicket(index)}
                        className="absolute top-2 right-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </button>
                    )}
                    <div className="space-y-3 pt-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">
                          Nama Kategori
                        </span>
                        <input
                          type="text"
                          value={ticket.name}
                          onChange={(e) =>
                            handleTicketChange(index, "name", e.target.value)
                          }
                          className="w-full bg-dark-gray border border-white/10 rounded p-2 text-sm text-white focus:border-soft-pink outline-none transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">
                            Harga (IDR)
                          </span>
                          <input
                            type="number"
                            value={ticket.price === 0 ? "" : ticket.price}
                            onChange={(e) =>
                              handleTicketChange(
                                index,
                                "price",
                                Number(e.target.value),
                              )
                            }
                            className="w-full bg-dark-gray border border-white/10 rounded p-2 text-sm text-soft-pink font-bold focus:border-soft-pink outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">
                            Kapasitas
                          </span>
                          <input
                            type="number"
                            value={
                              ticket.available_seats === 0
                                ? ""
                                : ticket.available_seats
                            }
                            onChange={(e) =>
                              handleTicketChange(
                                index,
                                "available_seats",
                                Number(e.target.value),
                              )
                            }
                            className="w-full bg-dark-gray border border-white/10 rounded p-2 text-sm text-white focus:border-soft-pink outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
