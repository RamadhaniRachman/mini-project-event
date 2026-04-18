import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EventDetail() {
  const { id } = useParams(); // Mengambil ID event dari URL (misal: /events/edit/:id)
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
  const [isDirectSaleActive, setIsDirectSaleActive] = useState(true);

  // State File Gambar & Preview
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    "https://images.unsplash.com/photo-1540039155732-684735035727?auto=format&fit=crop&q=80&w=400",
  ); // Default/Existing Image

  // State Tiket Dinamis
  const [tickets, setTickets] = useState([
    { id: "", name: "VIP Standing", price: 3400000, available_seats: 1500 },
  ]);

  // 1. Cek Akses & Ambil Data Event Lama
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

    // Ambil Data Event dari Backend berdasarkan ID
    const fetchEventDetail = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          // Isi kolom dengan data lama dari database
          setEventName(data.title);
          setEventLocation(data.location);
          setEventDescription(data.description);
          setEventCategory(data.category);
          // Konversi format tanggal API ke format datetime-local HTML
          if (data.event_date && data.event_time) {
            setEventDate(`${data.event_date}T${data.event_time}`);
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
  }, [id]);

  // 2. Handler Tambah/Hapus/Ubah Tiket
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

  // 3. Handler Ganti Poster
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Preview gambar baru
    }
  };

  // 4. Handler Simpan (Kirim PUT Request)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const submitData = new FormData();
      submitData.append("title", eventName);
      submitData.append("category", eventCategory);
      submitData.append("location", eventLocation);
      submitData.append("description", eventDescription);

      // Pisahkan tanggal dan waktu dari eventDate (format YYYY-MM-DDTHH:mm)
      if (eventDate) {
        const [date, time] = eventDate.split("T");
        submitData.append("event_date", date);
        submitData.append("event_time", time);
      }

      submitData.append("is_direct_sale", String(isDirectSaleActive));
      submitData.append("tickets", JSON.stringify(tickets));

      // Jika organizer mengunggah poster baru, masukkan ke FormData
      if (imageFile) {
        submitData.append("image", imageFile);
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/events/${id}`, {
        method: "PUT", // Gunakan PUT untuk Update
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      if (response.ok) {
        alert("🎉 Perubahan Event Berhasil Disimpan!");
        navigate("/events"); // Kembali ke daftar event
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Loading State
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-charcoal flex justify-center items-center text-soft-pink font-headline font-bold text-xl tracking-widest animate-pulse">
        MEMUAT STAGE...
      </div>
    );
  }

  return (
    <div className="dark bg-charcoal font-body text-white min-h-screen selection:bg-soft-pink selection:text-charcoal pb-24 md:pb-0">
      {/* ... ASIDE NAVBAR TETAP SAMA SEPERTI KODE ANDA ... */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-dark-gray py-8 space-y-4 shadow-[20px_0_40px_rgba(0,0,0,0.4)] z-50 border-r border-white/5">
        <div className="px-6 mb-8">
          <h1 className="text-2xl font-black text-soft-pink uppercase italic tracking-tighter font-headline">
            K-Tour Live
          </h1>
          <p className="font-label tracking-wide text-xs text-white/60 opacity-70 mt-1">
            Organizer Elite
          </p>
        </div>
        {/* Navigasi (Sama persis dengan kode Anda) */}
      </aside>

      <main className="md:ml-64 min-h-screen">
        {/* ... HEADER (TopAppBar) TETAP SAMA ... */}

        <div className="p-6 md:p-8 space-y-12 max-w-7xl mx-auto">
          {/* Header Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h3 className="text-5xl md:text-6xl font-extrabold tracking-tighter font-headline leading-none text-white">
                PERBARUI <span className="text-soft-pink">VISI</span> PANGGUNG
                ANDA
              </h3>
              <p className="mt-4 text-white/60 max-w-xl text-base leading-relaxed">
                Pastikan semua detail teknis dan logistik sudah akurat sebelum
                tiket mulai dijual.
              </p>
            </div>
            <div className="lg:col-span-4 justify-start lg:justify-end gap-4 hidden md:flex">
              <button
                type="button"
                onClick={() => window.history.back()}
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
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            onSubmit={handleSave}
          >
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <div className="bg-dark-gray border border-white/5 rounded-xl p-8 space-y-8 shadow-xl">
                {/* ... INPUT Nama, Tanggal, Kategori, Lokasi TETAP SAMA seperti punya Anda ... */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-white/60">
                      Nama Event
                    </span>
                    <input
                      className="w-full bg-charcoal border border-white/10 rounded-lg p-4 text-white focus:border-soft-pink outline-none"
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-white/60">
                        Tanggal & Waktu
                      </span>
                      <input
                        className="w-full bg-charcoal border border-white/10 rounded-lg p-4 text-white focus:border-soft-pink outline-none"
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
                        className="w-full bg-charcoal border border-white/10 rounded-lg p-4 text-white focus:border-soft-pink outline-none"
                        value={eventCategory}
                        onChange={(e) => setEventCategory(e.target.value)}
                      >
                        <option value="K-Pop Concert">K-Pop Concert</option>
                        <option value="Fan Meeting">Fan Meeting</option>
                        <option value="Music Festival">Music Festival</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* ... LOKASI DAN DESKRIPSI (Gunakan State onChange seperti kode Anda) ... */}
              </div>
            </div>

            <div className="space-y-6">
              {/* Media Upload Card */}
              <div className="bg-dark-gray border border-white/5 rounded-xl p-8 space-y-6 shadow-xl">
                <label className="block text-xs font-bold uppercase tracking-widest text-light-pink">
                  Poster Event
                </label>
                <div className="aspect-[3/4] w-full rounded-lg bg-charcoal border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-center p-6 relative group overflow-hidden hover:border-soft-pink cursor-pointer">
                  {/* Gunakan State imagePreview di sini */}
                  <img
                    alt="Poster"
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-20 transition-opacity"
                    src={imagePreview}
                  />
                  <div className="relative z-10 space-y-2 pointer-events-none flex flex-col items-center">
                    <span className="material-symbols-outlined text-4xl text-soft-pink group-hover:scale-110 transition-transform">
                      cloud_upload
                    </span>
                    <p className="text-sm font-medium text-white">
                      Ganti Poster
                    </p>
                  </div>
                  {/* Panggil handleImageChange */}
                  <input
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {/* Ticket Categories Section (Dibuat Dinamis dengan map) */}
              <div className="bg-dark-gray border border-white/5 rounded-xl p-8 space-y-6 shadow-xl">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-widest text-light-pink">
                    Kategori Tiket
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTicket}
                    className="text-soft-pink text-xs font-bold flex items-center hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm mr-1">
                      add
                    </span>{" "}
                    Tambah
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {tickets.map((ticket, index) => (
                    <div
                      key={index}
                      className="p-4 bg-charcoal rounded-lg space-y-3 relative group border border-white/5 hover:border-white/20 transition-colors"
                    >
                      {tickets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTicket(index)}
                          className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                        >
                          <span className="material-symbols-outlined text-lg">
                            delete
                          </span>
                        </button>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">
                            Nama Kategori
                          </span>
                          <input
                            type="text"
                            value={ticket.name}
                            onChange={(e) =>
                              handleTicketChange(index, "name", e.target.value)
                            }
                            className="w-full bg-dark-gray border border-white/10 rounded p-2 text-sm text-white focus:border-soft-pink outline-none"
                          />
                        </div>
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
                            className="w-full bg-dark-gray border border-white/10 rounded p-2 text-sm text-soft-pink font-bold focus:border-soft-pink outline-none"
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
                            className="w-full bg-dark-gray border border-white/10 rounded p-2 text-sm text-white focus:border-soft-pink outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
