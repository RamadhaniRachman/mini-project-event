export default function Transactions() {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* --- Page Header & Export --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-soft-pink font-bold text-xs tracking-[0.2em] uppercase mb-2 block">
            Management Center
          </span>
          <h2 className="font-headline text-5xl font-extrabold text-white">
            Transaksi Terbaru
          </h2>
        </div>
        <div className="flex gap-3">
          <button className="bg-dark-gray hover:bg-charcoal text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all border border-white/10">
            <span className="material-symbols-outlined text-lg">
              description
            </span>
            <span className="font-medium text-sm">Export to CSV</span>
          </button>
          <button className="bg-dark-gray hover:bg-charcoal text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all border border-white/10">
            <span className="material-symbols-outlined text-lg">
              picture_as_pdf
            </span>
            <span className="font-medium text-sm">Export to PDF</span>
          </button>
        </div>
      </div>

      {/* --- Summary Stats Bento Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Stat 1 */}
        <div className="bg-dark-gray border border-white/5 p-8 rounded-xl border-l-4 border-l-soft-pink relative overflow-hidden group hover:bg-charcoal transition-all">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-9xl">payments</span>
          </div>
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-4">
            Total Pendapatan
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">Rp 428.5M</span>
            <span className="text-light-pink text-xs font-bold">+12.4%</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-dark-gray border border-white/5 p-8 rounded-xl border-l-4 border-l-white/20 relative overflow-hidden group hover:bg-charcoal transition-all">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-9xl">
              confirmation_number
            </span>
          </div>
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-4">
            Tiket Terjual Hari Ini
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">1,284</span>
            <span className="text-light-pink text-xs font-bold">Units</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-dark-gray border border-white/5 p-8 rounded-xl border-l-4 border-l-red-400 relative overflow-hidden group hover:bg-charcoal transition-all">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-9xl">
              assignment_return
            </span>
          </div>
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-4">
            Refund Requests
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-red-400">12</span>
            <span className="text-red-400/60 text-xs font-bold">Pending</span>
          </div>
        </div>
      </div>

      {/* --- Detailed Transactions Table Section --- */}
      <div className="bg-dark-gray border border-white/5 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-charcoal">
          <h3 className="font-bold text-lg text-light-pink">
            Riwayat Pembayaran
          </h3>
          <div className="flex items-center gap-4">
            <select className="bg-transparent border-none text-xs text-white/60 focus:ring-0 cursor-pointer outline-none">
              <option className="bg-dark-gray">Semua Status</option>
              <option className="bg-dark-gray">Berhasil</option>
              <option className="bg-dark-gray">Menunggu</option>
              <option className="bg-dark-gray">Gagal</option>
            </select>
            <button className="material-symbols-outlined text-white/40 hover:text-white">
              filter_list
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-white/40 text-[10px] font-black tracking-[0.2em] uppercase bg-charcoal/50">
                <th className="px-8 py-5">ID Transaksi</th>
                <th className="px-8 py-5">Pembeli</th>
                <th className="px-8 py-5">Event</th>
                <th className="px-8 py-5">Tipe Tiket</th>
                <th className="px-8 py-5 text-right">Jumlah</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {/* Row 1 */}
              <tr className="hover:bg-white/5 transition-colors group">
                <td className="px-8 py-6 font-mono text-xs text-soft-pink">
                  #TX-9021-X1
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center text-[10px] font-bold border border-white/10">
                      JS
                    </div>
                    <div>
                      <p className="text-sm font-bold">Jessica Sunarto</p>
                      <p className="text-[10px] text-white/40">
                        jessica.s@email.com
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm">Noir Rose: Seoul Night</td>
                <td className="px-8 py-6">
                  <span className="bg-soft-pink/10 text-light-pink border border-soft-pink/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                    VVIP Backstage
                  </span>
                </td>
                <td className="px-8 py-6 text-right text-sm font-bold text-white">
                  Rp 4.500.000
                </td>
                <td className="px-8 py-6">
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    Berhasil
                  </span>
                </td>
                <td className="px-8 py-6 text-xs text-white/40">
                  Oct 24, 2026 • 14:20
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-white/5 transition-colors group">
                <td className="px-8 py-6 font-mono text-xs text-soft-pink">
                  #TX-8842-A2
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center text-[10px] font-bold text-light-pink border border-white/10">
                      BK
                    </div>
                    <div>
                      <p className="text-sm font-bold">Budi Kusuma</p>
                      <p className="text-[10px] text-white/40">
                        budi.k@provider.id
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm">Noir Rose: Seoul Night</td>
                <td className="px-8 py-6">
                  <span className="bg-charcoal text-white/60 border border-white/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                    General Admission
                  </span>
                </td>
                <td className="px-8 py-6 text-right text-sm font-bold text-white">
                  Rp 1.250.000
                </td>
                <td className="px-8 py-6">
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-yellow-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                    Menunggu
                  </span>
                </td>
                <td className="px-8 py-6 text-xs text-white/40">
                  Oct 24, 2026 • 13:45
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-white/5 transition-colors group">
                <td className="px-8 py-6 font-mono text-xs text-soft-pink">
                  #TX-7731-M5
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center text-[10px] font-bold border border-white/10">
                      AL
                    </div>
                    <div>
                      <p className="text-sm font-bold">Amanda Lee</p>
                      <p className="text-[10px] text-white/40">
                        amanda.lee@web.com
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm">Backstage Experience</td>
                <td className="px-8 py-6">
                  <span className="bg-soft-pink/10 text-light-pink border border-soft-pink/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                    Premium Access
                  </span>
                </td>
                <td className="px-8 py-6 text-right text-sm font-bold text-white">
                  Rp 2.800.000
                </td>
                <td className="px-8 py-6">
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Gagal
                  </span>
                </td>
                <td className="px-8 py-6 text-xs text-white/40">
                  Oct 24, 2026 • 11:12
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 border-t border-white/10 bg-charcoal/50 flex justify-between items-center">
          <p className="text-xs text-white/40 italic">
            Menampilkan 3 dari 2,492 transaksi terverifikasi
          </p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded bg-charcoal flex items-center justify-center text-white/40 hover:text-light-pink transition-colors border border-white/5">
              <span className="material-symbols-outlined text-sm">
                chevron_left
              </span>
            </button>
            <button className="w-8 h-8 rounded bg-soft-pink/10 text-light-pink flex items-center justify-center text-xs font-bold border border-soft-pink/20">
              1
            </button>
            <button className="w-8 h-8 rounded bg-transparent hover:bg-white/5 text-white/40 flex items-center justify-center text-xs font-bold border border-transparent">
              2
            </button>
            <button className="w-8 h-8 rounded bg-transparent hover:bg-white/5 text-white/40 flex items-center justify-center text-xs font-bold border border-transparent">
              3
            </button>
            <span className="text-white/20 mx-1">...</span>
            <button className="w-8 h-8 rounded bg-charcoal flex items-center justify-center text-white/40 hover:text-light-pink transition-colors border border-white/5">
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* --- Asymmetric Promotional Footer --- */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 bg-gradient-to-r from-dark-gray to-charcoal border border-white/5 p-10 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="font-headline text-2xl font-bold text-light-pink mb-2">
              Automated Payouts are Active
            </h4>
            <p className="text-white/60 text-sm max-w-md leading-relaxed">
              Dana hasil penjualan tiket akan secara otomatis ditransfer ke
              rekening utama Anda setiap hari Jumat pukul 00:00 WIB.
            </p>
          </div>
          <div className="absolute right-8 top-8 w-48 h-48 bg-soft-pink/10 blur-3xl rounded-full"></div>
        </div>
        <div className="md:col-span-4 bg-dark-gray p-8 rounded-xl flex flex-col items-center justify-center text-center gap-4 border border-soft-pink/10">
          <span className="material-symbols-outlined text-soft-pink text-4xl">
            verified_user
          </span>
          <div>
            <p className="text-sm font-bold text-white">Secure Settlement</p>
            <p className="text-[10px] text-white/40 mt-1">
              PCI-DSS Compliant Infrastructure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
