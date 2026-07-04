import { useState, useEffect } from 'react'
import { trpc } from '@/providers/trpc'
import Layout from '@/components/Layout'
import {
  Search,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'

function formatRupiah(n: number): string {
  if (!n || isNaN(n)) return 'Rp 0'
  return `Rp ${n.toLocaleString('id-ID')}`
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getAvatarColor(index: number): string {
  const colors = ['#FF6B6B', '#4DABF7', '#40C057', '#B7C0C9', '#FF6B6B', '#4DABF7', '#40C057', '#B7C0C9', '#FF6B6B', '#4DABF7']
  return colors[index % colors.length]
}

function getStatusBadge(status: string) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    aktif: { bg: 'rgba(64,192,87,0.15)', text: '#40C057', label: 'Aktif' },
    nonaktif: { bg: 'rgba(183,192,201,0.2)', text: '#5C677D', label: 'Nonaktif' },
    kredit_penuh: { bg: 'rgba(255,107,107,0.15)', text: '#FF6B6B', label: 'Kredit Penuh' },
  }
  const s = styles[status] || styles.nonaktif
  return (
    <span className="inline-flex px-3 py-0.5 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  )
}

export default function DaftarMitra() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [sort, setSort] = useState('terbaru')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    nama: '',
    namaPemilik: '',
    nomorHp: '',
    alamat: '',
    limitKredit: '2000000',
    status: 'aktif' as 'aktif' | 'nonaktif' | 'kredit_penuh',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const utils = trpc.useUtils()
  const { data, isLoading } = trpc.mitra.list.useQuery({
    search: search || undefined,
    status: statusFilter,
    sort,
    page,
    limit,
  })

  const createMitra = trpc.mitra.create.useMutation({
    onSuccess: () => {
      utils.mitra.list.invalidate()
      utils.dashboard.stats.invalidate()
      utils.dashboard.recentMitra.invalidate()
      setModalOpen(false)
      setFormData({ nama: '', namaPemilik: '', nomorHp: '', alamat: '', limitKredit: '2000000', status: 'aktif' })
      setErrors({})
    },
  })

  const deleteMitra = trpc.mitra.delete.useMutation({
    onSuccess: () => {
      utils.mitra.list.invalidate()
      utils.dashboard.stats.invalidate()
      utils.dashboard.recentMitra.invalidate()
    },
  })

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, sort])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.nama.trim()) newErrors.nama = 'Nama mitra wajib diisi'
    if (!formData.namaPemilik.trim()) newErrors.namaPemilik = 'Nama pemilik wajib diisi'
    if (!formData.nomorHp.trim()) newErrors.nomorHp = 'Nomor HP wajib diisi'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return
    createMitra.mutate({
      nama: formData.nama,
      namaPemilik: formData.namaPemilik,
      nomorHp: formData.nomorHp,
      alamat: formData.alamat,
      limitKredit: formData.limitKredit,
      status: formData.status,
    })
  }

  const totalPages = data?.totalPages || 1

  return (
    <Layout>
      <div className="min-h-screen" style={{ background: 'var(--warm-ivory)' }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--slate-dark)', letterSpacing: '-0.02em' }}>
              Daftar Mitra
            </h1>
            <p className="mt-2 text-base" style={{ color: 'var(--slate-medium)', maxWidth: 560 }}>
              Kelola semua mitra konter pulsa yang terhubung dengan platform Anda.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap gap-3 mt-8">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--slate-light)' }} />
              <input
                type="text"
                placeholder="Cari mitra..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                style={{ background: 'white', borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 px-3 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] cursor-pointer"
              style={{ background: 'white', borderColor: 'var(--slate-light)', color: 'var(--slate-dark)', minWidth: 140 }}
            >
              <option value="semua">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="kredit_penuh">Kredit Penuh</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 px-3 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] cursor-pointer"
              style={{ background: 'white', borderColor: 'var(--slate-light)', color: 'var(--slate-dark)', minWidth: 140 }}
            >
              <option value="terbaru">Terbaru</option>
              <option value="nama_asc">Nama A-Z</option>
              <option value="kredit_tertinggi">Kredit Tertinggi</option>
            </select>
            <button
              onClick={() => setModalOpen(true)}
              className="h-11 px-5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:scale-[1.03] hover:shadow-lg"
              style={{ background: 'var(--deep-navy)', color: 'var(--warm-ivory)' }}
            >
              <Plus size={16} /> Tambah Mitra
            </button>
          </div>

          {/* Table */}
          <div className="mt-6 bg-white rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid rgba(183,192,201,0.4)' }}>
            {/* Header */}
            <div
              className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_60px] gap-4 px-6 py-3 text-xs font-medium uppercase tracking-[0.05em]"
              style={{ background: 'var(--surface-light)', color: 'var(--slate-medium)' }}
            >
              <span>Mitra</span>
              <span>Nomor HP</span>
              <span>Limit Kredit</span>
              <span>Kredit Terpakai</span>
              <span>Sisa Kredit</span>
              <span>Status</span>
              <span></span>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="px-6 py-8 text-center">
                <div className="inline-block w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--slate-light)', borderTopColor: 'var(--deep-navy)' }} />
                <p className="mt-2 text-sm" style={{ color: 'var(--slate-medium)' }}>Memuat data...</p>
              </div>
            )}

            {/* Rows */}
            {!isLoading && (data?.items || []).map((m: any, i: number) => (
              <div
                key={m.id}
                className="grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_60px] gap-4 px-6 py-4 items-center transition-colors duration-200 hover:bg-[#F8F9FA]"
                style={{ borderBottom: '1px solid rgba(183,192,201,0.2)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: getAvatarColor(i) }}
                  >
                    {getInitials(m.nama)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--slate-dark)' }}>{m.nama}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--slate-medium)' }}>{m.alamat?.slice(0, 40) || '-'}</p>
                  </div>
                </div>
                <span className="text-sm" style={{ color: 'var(--slate-medium)' }}>{m.nomorHp}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--slate-dark)' }}>{formatRupiah(Number(m.limitKredit))}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--slate-dark)' }}>{formatRupiah(Number(m.kreditTerpakai))}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--accent-green)' }}>
                  {formatRupiah(Math.max(0, Number(m.limitKredit) - Number(m.kreditTerpakai)))}
                </span>
                <div>{getStatusBadge(m.status)}</div>
                <div className="relative">
                  <button
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setDropdownOpen(dropdownOpen === m.id ? null : m.id)}
                  >
                    <MoreVertical size={16} style={{ color: 'var(--slate-medium)' }} />
                  </button>
                  {dropdownOpen === m.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(null)} />
                      <div className="absolute right-0 top-8 z-50 w-40 bg-white rounded-lg shadow-lg py-1" style={{ border: '1px solid var(--slate-light)' }}>
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors" style={{ color: 'var(--slate-dark)' }}>
                          Lihat Detail
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors" style={{ color: 'var(--slate-dark)' }}>
                          Edit
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                          style={{ color: 'var(--accent-coral)' }}
                          onClick={() => { deleteMitra.mutate({ id: m.id }); setDropdownOpen(null) }}
                        >
                          Hapus
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Empty state */}
            {!isLoading && (!data?.items || data.items.length === 0) && (
              <div className="px-6 py-12 text-center">
                <img src="/assets/empty-state.jpg" alt="Tidak ada data" className="w-40 h-auto mx-auto mb-4 opacity-60" />
                <p className="text-sm font-medium" style={{ color: 'var(--slate-medium)' }}>Belum ada mitra</p>
                <p className="text-xs mt-1" style={{ color: 'var(--slate-light)' }}>Tambah mitra baru untuk memulai</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm" style={{ color: 'var(--slate-medium)' }}>
                Menampilkan {((page - 1) * limit) + 1}-{Math.min(page * limit, data?.total || 0)} dari {data?.total || 0} mitra
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg transition-colors disabled:opacity-30"
                  style={{ color: 'var(--slate-dark)' }}
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: p === page ? 'var(--deep-navy)' : 'transparent',
                      color: p === page ? 'var(--warm-ivory)' : 'var(--slate-dark)',
                    }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg transition-colors disabled:opacity-30"
                  style={{ color: 'var(--slate-dark)' }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Mitra Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,48,73,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--slate-light)' }}>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--slate-dark)' }}>Tambah Mitra Baru</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} style={{ color: 'var(--slate-medium)' }} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Nama Mitra / Konter *</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                  style={{ borderColor: errors.nama ? 'var(--accent-coral)' : 'var(--slate-light)', color: 'var(--slate-dark)' }}
                  placeholder="Contoh: PT Sumber Pulsa"
                />
                {errors.nama && <p className="mt-1 text-xs" style={{ color: 'var(--accent-coral)' }}>{errors.nama}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Nama Pemilik *</label>
                <input
                  type="text"
                  value={formData.namaPemilik}
                  onChange={(e) => setFormData({ ...formData, namaPemilik: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                  style={{ borderColor: errors.namaPemilik ? 'var(--accent-coral)' : 'var(--slate-light)', color: 'var(--slate-dark)' }}
                  placeholder="Contoh: Budi Santoso"
                />
                {errors.namaPemilik && <p className="mt-1 text-xs" style={{ color: 'var(--accent-coral)' }}>{errors.namaPemilik}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Nomor HP *</label>
                <input
                  type="tel"
                  value={formData.nomorHp}
                  onChange={(e) => setFormData({ ...formData, nomorHp: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                  style={{ borderColor: errors.nomorHp ? 'var(--accent-coral)' : 'var(--slate-light)', color: 'var(--slate-dark)' }}
                  placeholder="Contoh: 081234567890"
                />
                {errors.nomorHp && <p className="mt-1 text-xs" style={{ color: 'var(--accent-coral)' }}>{errors.nomorHp}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Alamat</label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors resize-none"
                  style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                  placeholder="Alamat lengkap mitra..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Limit Kredit (Rp)</label>
                <input
                  type="number"
                  value={formData.limitKredit}
                  onChange={(e) => setFormData({ ...formData, limitKredit: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                  style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'aktif' | 'nonaktif' | 'kredit_penuh' })}
                  className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] cursor-pointer"
                  style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--slate-light)' }}>
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 h-10 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ border: '1px solid var(--slate-light)', color: 'var(--slate-medium)' }}
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMitra.isPending}
                className="px-5 h-10 rounded-lg text-sm font-semibold text-white transition-all hover:scale-[1.03] disabled:opacity-50"
                style={{ background: 'var(--deep-navy)' }}
              >
                {createMitra.isPending ? 'Menyimpan...' : 'Simpan Mitra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
