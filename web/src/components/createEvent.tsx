import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const API_URL = import.meta.env.VITE_PROJECT_API;

  // 1. State untuk menampung ketikan user
  const [formData, setFormData] = useState({
    title: "",
    category: "Music",
    location: "",
    event_date: "",
    event_time: "",
    description: "",
    is_free: false,
  });

  // 2. State khusus untuk Tiket (Bisa tambah/kurang tipe tiket)
  const [tickets, setTickets] = useState([
    { name: "Reguler", price: 0, available_seats: 0 },
    { name: "VIP", price: 0, available_seats: 0 },
  ]);

  // 3. State khusus untuk File Gambar dan Preview-nya
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // --- HANDLER UNTUK INPUT BIASA ---
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // --- HANDLER UNTUK TIKET ---
  const handleTicketChange = (index: number, field: string, value: string) => {
    const newTickets = [...tickets];
    const updatedValue =
      field === "price" || field === "available_seats"
        ? value === ""
          ? 0
          : Number(value)
        : value;

    newTickets[index] = { ...newTickets[index], [field]: updatedValue };
    setTickets(newTickets);
  };

  // --- HANDLER UNTUK UPLOAD FOTO ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Buat URL sementara untuk preview gambar di layar
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // --- FUNGSI PELATUK (SUBMIT KE BACKEND) ---
  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    // Validasi wajid unggah poster
    if (!imageFile) {
      setErrorMsg("Harap unggah poster event!");
      setIsLoading(false);
      return;
    }

    try {
      // WAJIB MENGGUNAKAN FORMDATA KARENA ADA FILE GAMBAR
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("category", formData.category);
      submitData.append("location", formData.location);
      submitData.append("event_date", formData.event_date);
      submitData.append("event_time", formData.event_time);
      submitData.append("description", formData.description);
      submitData.append("is_free", String(formData.is_free));

      // Ubah array tiket menjadi string JSON agar bisa dibawa oleh FormData
      submitData.append("tickets", JSON.stringify(tickets));

      // Masukkan file gambar (Nama 'image' harus sama dengan upload.single('image') di backend)
      submitData.append("image", imageFile);

      const token = localStorage.getItem("token");

      console.log("🚀 MENGIRIM DATA KE BACKEND...");

      // Catatan Penting: Saat pakai FormData dan Fetch, JANGAN set Content-Type manual.
      // Browser akan otomatis menyetelnya menjadi multipart/form-data beserta kode boundary-nya.
      const response = await fetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      const result = await response.json();

      if (response.ok) {
        alert("🎉 Event Berhasil Dibuat dan Foto Tersimpan di Cloudinary!");
        navigate("/dashboard/events"); // Lempar kembali ke halaman MyEvents
      } else {
        setErrorMsg(result.message || "Gagal membuat event");
      }
    } catch (error) {
      console.error("Error submit:", error);
      setErrorMsg("Terjadi kesalahan pada jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in duration-500 pb-24">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-2 font-headline">
          Buat Event Baru
        </h1>
        <p className="text-white/60">
          Isi detail pertunjukan panggung Anda di bawah ini.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 font-bold text-sm">
          {errorMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-dark-gray p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl"
      >
        {/* --- SECTION 1: POSTER UPLOAD --- */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-soft-pink uppercase tracking-widest">
            Poster Event
          </label>
          <div className="relative w-full h-64 md:h-80 rounded-xl border-2 border-dashed border-white/20 bg-charcoal hover:border-soft-pink/50 transition-colors flex flex-col justify-center items-center overflow-hidden group cursor-pointer">
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-bold bg-charcoal/80 px-4 py-2 rounded-lg">
                    Ganti Poster
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center">
                <span className="material-symbols-outlined text-4xl text-white/40 mb-2 group-hover:text-soft-pink transition-colors">
                  cloud_upload
                </span>
                <p className="text-white/60 font-medium">
                  Klik untuk mengunggah poster
                </p>
                <p className="text-xs text-white/40 mt-1">
                  JPG, PNG, WEBP (Max 5MB)
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* --- SECTION 2: BASIC INFO --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest">
              Nama Event
            </label>
            <input
              required
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full bg-charcoal border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-soft-pink"
              placeholder="Contoh: Rock Concert 2026"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest">
              Kategori
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full bg-charcoal border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-soft-pink"
            >
              <option value="Konser">Konser</option>
              <option value="Fan Event">Fan Event</option>
              <option value="Festival">Festival</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest">
              Tanggal
            </label>
            <input
              required
              type="date"
              name="event_date"
              value={formData.event_date}
              onChange={handleInputChange}
              className="w-full bg-charcoal border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-soft-pink [color-scheme:dark]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest">
              Waktu (Jam)
            </label>
            <input
              required
              type="time"
              name="event_time"
              value={formData.event_time}
              onChange={handleInputChange}
              className="w-full bg-charcoal border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-soft-pink [color-scheme:dark]"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest">
              Lokasi / Venue
            </label>
            <input
              required
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full bg-charcoal border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-soft-pink"
              placeholder="Contoh: Gelora Bung Karno"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest">
              Deskripsi Event
            </label>
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full bg-charcoal border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-soft-pink resize-none"
              placeholder="Ceritakan detail menarik dan line-up artis di event ini..."
            />
          </div>
        </div>

        {/* --- SECTION 3: TICKETING --- */}
        {/* Bagian TICKETING di dalam Return */}
        <div className="p-6 bg-charcoal rounded-xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-bold text-soft-pink flex items-center gap-2">
              <span className="material-symbols-outlined">
                confirmation_number
              </span>
              Kategori Tiket
            </h3>
            {/* Status Gratis tetap ada untuk kontrol global jika perlu */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                name="is_free"
                checked={formData.is_free}
                onChange={handleInputChange}
                className="accent-soft-pink w-4 h-4"
              />
              <span className="text-xs font-bold text-white/40 group-hover:text-soft-pink uppercase tracking-widest transition-colors">
                Set Semua Gratis
              </span>
            </label>
          </div>

          <div className="space-y-6">
            {tickets.map((ticket, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-dark-gray/50 rounded-lg border border-white/5"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Tipe Tiket
                  </label>
                  <input
                    readOnly // Biar user nggak ubah nama kategori defaultnya
                    value={ticket.name}
                    className="w-full bg-charcoal border border-white/5 rounded-lg p-3 text-soft-pink text-sm font-bold outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    disabled={formData.is_free}
                    value={
                      formData.is_free
                        ? 0
                        : ticket.price === 0
                          ? ""
                          : ticket.price
                    }
                    onChange={(e) =>
                      handleTicketChange(index, "price", e.target.value)
                    }
                    className="w-full bg-charcoal border border-white/10 rounded-lg p-3 text-white text-sm disabled:opacity-30 focus:border-soft-pink outline-none"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Kapasitas (Kursi)
                  </label>
                  <input
                    type="number"
                    value={
                      ticket.available_seats === 0 ? "" : ticket.available_seats
                    }
                    onChange={(e) =>
                      handleTicketChange(
                        index,
                        "available_seats",
                        e.target.value,
                      )
                    }
                    className="w-full bg-charcoal border border-white/10 rounded-lg p-3 text-white text-sm focus:border-soft-pink outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 stage-gradient text-charcoal font-black rounded-xl text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-soft-pink/20 disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin material-symbols-outlined">
                sync
              </span>{" "}
              Memproses...
            </>
          ) : (
            "Buat Event!"
          )}
        </button>
      </form>
    </div>
  );
}
