import { useState, useEffect } from 'react'
import { trpc } from '@/providers/trpc'
import Layout from '@/components/Layout'
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

function formatRupiah(n: number): string {
  if (!n || isNaN(n)) return 'Rp 0'
  return `Rp ${n.toLocaleString('id-ID')}`
}

const tabs = [
  { key: 'semua', label: 'Semua' },
  { key: 'pulsa', label: 'Pulsa' },
  { key: 'paket_data', label: 'Paket Data' },
  { key: 'belum_lunas', label: 'Belum Lunas' },
  { key: 'lunas', label: 'Lunas' },
]

export default function Transaksi() {
  const [activeTab, setActiveTab] = useState('semua')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    mitraId: 0,
    tipe: 'pulsa' as 'pulsa' | 'paket_data',
    nomorHpTujuan: '',
    nominal: '',
    keterangan: '',
    statusPembayaran: 'belum_lunas' as 'lunas' | 'belum_lunas',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const utils = trpc.useUtils()

  // Determine filter type
  const tipeFilter = activeTab === 'pulsa' || activeTab === 'paket_data' ? activeTab : undefined
  const statusFilter = activeTab === 'belum_lunas' || activeTab === 'lunas' ? activeTab : undefined

  const { data, isLoading } = trpc.transaction.list.useQuery({
    tipe: tipeFilter,
    status: statusFilter,
    page,
    limit,
  })

  const { data: mitraDropdown } = trpc.mitra.dropdown.useQuery()

  const createTx = trpc.transaction.create.useMutation({
    onSuccess: () => {
      utils.transaction.list.invalidate()
      utils.dashboard.stats.invalidate()
      utils.dashboard.recentTransactions.invalidate()
      utils.mitra.list.invalidate()
      utils.dashboard.recentMitra.invalidate()
      setModalOpen(false)
      resetForm()
    },
  })



  useEffect(() => {
    setPage(1)
  }, [activeTab])

  const resetForm = () => {
    setFormData({
      mitraId: 0,
      tipe: 'pulsa',
      nomorHpTujuan: '',
      nominal: '',
      keterangan: '',
      statusPembayaran: 'belum_lunas',
    })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.mitraId) newErrors.mitraId = 'Pilih mitra'
    if (!formData.nomorHpTujuan.trim()) newErrors.nomorHpTujuan = 'Nomor HP tujuan wajib diisi'
    if (!formData.nominal || Number(formData.nominal) <= 0) newErrors.nominal = 'Nominal wajib diisi'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return
    createTx.mutate({
      mitraId: formData.mitraId,
      tipe: formData.tipe,
      nomorHpTujuan: formData.nomorHpTujuan,
      nominal: formData.nominal,
      keterangan: formData.keterangan || undefined,
      statusPembayaran: formData.statusPembayaran,
    })
  }

  const selectedMitra = (mitraDropdown || []).find((m: any) => m.id === formData.mitraId)

  const totalPages = data?.totalPages || 1

  return (
    <Layout>
      <div className="min-h-screen" style={{ background: 'var(--warm-ivory)' }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--slate-dark)', letterSpacing: '-0.02em' }}>
                Transaksi
              </h1>
              <p className="mt-2 text-base" style={{ color: 'var(--slate-medium)' }}>
                Kelola dan pantau semua transaksi pulsa dan paket data mitra.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="h-11 px-5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:scale-[1.03] hover:shadow-lg self-start"
              style={{ background: 'var(--accent-coral)', color: 'white' }}
            >
              <Plus size={16} /> Catat Transaksi
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mt-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: activeTab === tab.key ? 'var(--deep-navy)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--warm-ivory)' : 'var(--slate-medium)',
                  border: activeTab === tab.key ? 'none' : '1px solid var(--slate-light)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Transaction Cards */}
          <div className="mt-6 space-y-3">
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--slate-light)', borderTopColor: 'var(--deep-navy)' }} />
                <p className="mt-2 text-sm" style={{ color: 'var(--slate-medium)' }}>Memuat transaksi...</p>
              </div>
            )}

            {!isLoading && (data?.items || []).map((tx: any) => (
              <div
                key={tx.id}
                className="bg-white rounded-xl p-4 flex items-center gap-4 transition-all duration-200 hover:translate-x-1 cursor-pointer"
                style={{ border: '1px solid rgba(183,192,201,0.3)' }}
              >
                {/* Date block */}
                <div
                  className="w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0"
                  style={{ background: 'var(--surface-light)' }}
                >
                  <span className="text-lg font-bold leading-none" style={{ color: 'var(--slate-dark)' }}>
                    {new Date(tx.createdAt).getDate()}
                  </span>
                  <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--slate-medium)' }}>
                    {new Date(tx.createdAt).toLocaleDateString('id-ID', { month: 'short' })}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: 'var(--slate-dark)' }}>{tx.mitraNama}</span>
                    <span
                      className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        background: tx.tipe === 'pulsa' ? 'rgba(77,171,247,0.15)' : 'rgba(255,107,107,0.15)',
                        color: tx.tipe === 'pulsa' ? 'var(--accent-blue)' : 'var(--accent-coral)',
                      }}
                    >
                      {tx.tipe === 'pulsa' ? 'Pulsa' : 'Paket Data'}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--slate-medium)' }}>{tx.nomorHpTujuan}</p>
                </div>

                {/* Amount & Status */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: 'var(--slate-dark)' }}>{formatRupiah(Number(tx.nominal))}</p>
                  <span
                    className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-medium mt-1"
                    style={{
                      background: tx.statusPembayaran === 'lunas' ? 'rgba(64,192,87,0.15)' : 'rgba(255,107,107,0.15)',
                      color: tx.statusPembayaran === 'lunas' ? 'var(--accent-green)' : 'var(--accent-coral)',
                    }}
                  >
                    {tx.statusPembayaran === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                  </span>
                </div>

                <ChevronRight size={16} style={{ color: 'var(--slate-light)' }} className="shrink-0 hidden sm:block" />
              </div>
            ))}

            {!isLoading && (!data?.items || data.items.length === 0) && (
              <div className="text-center py-12">
                <img src="/assets/empty-state.jpg" alt="Tidak ada data" className="w-40 h-auto mx-auto mb-4 opacity-60" />
                <p className="text-sm font-medium" style={{ color: 'var(--slate-medium)' }}>Belum ada transaksi</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm" style={{ color: 'var(--slate-medium)' }}>
                Halaman {page} dari {totalPages}
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

      {/* Record Transaction Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,48,73,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--slate-light)' }}>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--slate-dark)' }}>Catat Transaksi Baru</h3>
              <button onClick={() => { setModalOpen(false); resetForm() }} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} style={{ color: 'var(--slate-medium)' }} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Mitra Select */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Pilih Mitra *</label>
                <select
                  value={formData.mitraId || ''}
                  onChange={(e) => setFormData({ ...formData, mitraId: Number(e.target.value) })}
                  className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] cursor-pointer"
                  style={{ borderColor: errors.mitraId ? 'var(--accent-coral)' : 'var(--slate-light)', color: 'var(--slate-dark)' }}
                >
                  <option value="">Pilih mitra...</option>
                  {(mitraDropdown || []).map((m: any) => (
                    <option key={m.id} value={m.id}>{m.nama}</option>
                  ))}
                </select>
                {errors.mitraId && <p className="mt-1 text-xs" style={{ color: 'var(--accent-coral)' }}>{errors.mitraId}</p>}
              </div>

              {/* Tipe Transaksi */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Tipe Transaksi</label>
                <div className="flex gap-2">
                  {(['pulsa', 'paket_data'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFormData({ ...formData, tipe: t })}
                      className="flex-1 h-11 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: formData.tipe === t ? 'var(--deep-navy)' : 'white',
                        color: formData.tipe === t ? 'var(--warm-ivory)' : 'var(--slate-medium)',
                        border: formData.tipe === t ? 'none' : '1px solid var(--slate-light)',
                      }}
                    >
                      {t === 'pulsa' ? 'Pulsa' : 'Paket Data'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nomor HP */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Nomor HP Tujuan *</label>
                <input
                  type="tel"
                  value={formData.nomorHpTujuan}
                  onChange={(e) => setFormData({ ...formData, nomorHpTujuan: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                  style={{ borderColor: errors.nomorHpTujuan ? 'var(--accent-coral)' : 'var(--slate-light)', color: 'var(--slate-dark)' }}
                  placeholder="Contoh: 081298765432"
                />
                {errors.nomorHpTujuan && <p className="mt-1 text-xs" style={{ color: 'var(--accent-coral)' }}>{errors.nomorHpTujuan}</p>}
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Nominal (Rp) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--slate-medium)' }}>Rp</span>
                  <input
                    type="number"
                    value={formData.nominal}
                    onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
                    className="w-full h-11 pl-12 pr-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                    style={{ borderColor: errors.nominal ? 'var(--accent-coral)' : 'var(--slate-light)', color: 'var(--slate-dark)' }}
                    placeholder="50000"
                  />
                </div>
                {errors.nominal && <p className="mt-1 text-xs" style={{ color: 'var(--accent-coral)' }}>{errors.nominal}</p>}
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Keterangan (Opsional)</label>
                <textarea
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors resize-none"
                  style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                  placeholder="Keterangan tambahan..."
                />
              </div>

              {/* Status Pembayaran */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Status Pembayaran</label>
                <div className="flex gap-2">
                  {(['belum_lunas', 'lunas'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFormData({ ...formData, statusPembayaran: s })}
                      className="flex-1 h-11 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: formData.statusPembayaran === s ? (s === 'lunas' ? 'var(--accent-green)' : 'var(--accent-coral)') : 'white',
                        color: formData.statusPembayaran === s ? 'white' : 'var(--slate-medium)',
                        border: formData.statusPembayaran === s ? 'none' : '1px solid var(--slate-light)',
                      }}
                    >
                      {s === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {selectedMitra && formData.nominal && (
                <div className="rounded-lg p-4" style={{ background: 'var(--surface-light)' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--slate-medium)' }}>Preview</p>
                  <div className="text-sm space-y-1" style={{ color: 'var(--slate-dark)' }}>
                    <p><span className="font-medium">Mitra:</span> {selectedMitra.nama}</p>
                    <p><span className="font-medium">Tipe:</span> {formData.tipe === 'pulsa' ? 'Pulsa' : 'Paket Data'}</p>
                    <p><span className="font-medium">Nominal:</span> {formatRupiah(Number(formData.nominal))}</p>
                    <p><span className="font-medium">Status:</span> {formData.statusPembayaran === 'lunas' ? 'Lunas' : 'Belum Lunas'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--slate-light)' }}>
              <button
                onClick={() => { setModalOpen(false); resetForm() }}
                className="px-5 h-10 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ border: '1px solid var(--slate-light)', color: 'var(--slate-medium)' }}
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={createTx.isPending}
                className="px-5 h-10 rounded-lg text-sm font-semibold text-white transition-all hover:scale-[1.03] disabled:opacity-50"
                style={{ background: 'var(--accent-coral)' }}
              >
                {createTx.isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
