import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import Layout from '@/components/Layout'
import {
  X,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  TrendingUp,
  Wallet,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'

function formatRupiah(n: number): string {
  if (!n || isNaN(n)) return 'Rp 0'
  return `Rp ${n.toLocaleString('id-ID')}`
}

function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getStatusIcon(status: string) {
  if (status === 'lunas') return <CheckCircle size={16} style={{ color: 'var(--accent-green)' }} />
  if (status === 'belum_lunas') return <AlertCircle size={16} style={{ color: 'var(--accent-coral)' }} />
  return <Clock size={16} style={{ color: 'var(--accent-blue)' }} />
}

function getStatusBadge(status: string) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    lunas: { bg: 'rgba(64,192,87,0.15)', text: '#40C057', label: 'Lunas' },
    belum_lunas: { bg: 'rgba(255,107,107,0.15)', text: '#FF6B6B', label: 'Belum Bayar' },
  }
  const s = styles[status] || styles.belum_lunas
  return (
    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.text }}>
      {getStatusIcon(status)} {s.label}
    </span>
  )
}

export default function Pembayaran() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<any>(null)

  const [formData, setFormData] = useState({
    jumlahBayar: '',
    tanggalBayar: new Date().toISOString().split('T')[0],
    metodePembayaran: 'tunai' as 'tunai' | 'transfer_bank' | 'qris' | 'lainnya',
    keterangan: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const utils = trpc.useUtils()
  const { data: stats } = trpc.dashboard.stats.useQuery()

  // Get all transactions with unpaid status for the payment list
  const { data: txData, isLoading } = trpc.transaction.list.useQuery({
    page,
    limit,
  })

  const { data: paymentsData } = trpc.payment.list.useQuery({ page: 1, limit: 100 })

  const createPayment = trpc.payment.create.useMutation({
    onSuccess: () => {
      utils.payment.list.invalidate()
      utils.transaction.list.invalidate()
      utils.dashboard.stats.invalidate()
      utils.mitra.list.invalidate()
      setModalOpen(false)
      setSelectedTx(null)
      resetForm()
    },
  })

  const resetForm = () => {
    setFormData({
      jumlahBayar: '',
      tanggalBayar: new Date().toISOString().split('T')[0],
      metodePembayaran: 'tunai',
      keterangan: '',
    })
    setErrors({})
  }

  const openPaymentModal = (tx: any) => {
    setSelectedTx(tx)
    const remaining = Number(tx.nominal) - getPaidAmount(tx.id)
    setFormData({
      jumlahBayar: String(remaining),
      tanggalBayar: new Date().toISOString().split('T')[0],
      metodePembayaran: 'tunai',
      keterangan: '',
    })
    setModalOpen(true)
  }

  const getPaidAmount = (txId: number): number => {
    if (!paymentsData?.items) return 0
    return paymentsData.items
      .filter((p: any) => p.transactionId === txId)
      .reduce((sum: number, p: any) => sum + Number(p.jumlahBayar), 0)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.jumlahBayar || Number(formData.jumlahBayar) <= 0) newErrors.jumlahBayar = 'Jumlah pembayaran wajib diisi'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm() || !selectedTx) return
    createPayment.mutate({
      transactionId: selectedTx.id,
      mitraId: selectedTx.mitraId,
      jumlahBayar: formData.jumlahBayar,
      tanggalBayar: formData.tanggalBayar,
      metodePembayaran: formData.metodePembayaran,
      keterangan: formData.keterangan || undefined,
    })
  }

  // Combine transactions with their payment info
  const transactionsWithPayments = (txData?.items || []).map((tx: any) => {
    const paid = getPaidAmount(tx.id)
    const total = Number(tx.nominal)
    const remaining = Math.max(0, total - paid)
    let status = tx.statusPembayaran
    if (status === 'belum_lunas' && paid > 0 && remaining > 0) {
      status = 'dicicil'
    }
    return { ...tx, paid, remaining, status }
  })

  const totalPages = txData?.totalPages || 1

  return (
    <Layout>
      <div className="min-h-screen" style={{ background: 'var(--warm-ivory)' }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--slate-dark)', letterSpacing: '-0.02em' }}>
              Pembayaran
            </h1>
            <p className="mt-2 text-base" style={{ color: 'var(--slate-medium)' }}>
              Pantau dan kelola pembayaran dari mitra konter pulsa.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="rounded-xl p-5" style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,107,107,0.15)' }}>
                  <ClipboardList size={20} style={{ color: 'var(--accent-coral)' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--accent-coral)' }}>Total Piutang</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--accent-coral)' }}>
                {formatRupiah(stats?.totalPiutang || 0)}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--slate-medium)' }}>
                Dari {stats?.totalTransaksi || 0} transaksi
              </p>
            </div>

            <div className="rounded-xl p-5" style={{ background: 'rgba(77,171,247,0.1)', border: '1px solid rgba(77,171,247,0.2)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(77,171,247,0.15)' }}>
                  <TrendingUp size={20} style={{ color: 'var(--accent-blue)' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--accent-blue)' }}>Pembayaran Bulan Ini</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--accent-blue)' }}>
                {formatRupiah(stats?.totalPembayaranBulanIni || 0)}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--slate-medium)' }}>
                {stats?.transaksiLunas || 0} transaksi lunas
              </p>
            </div>

            <div className="rounded-xl p-5" style={{ background: 'rgba(64,192,87,0.1)', border: '1px solid rgba(64,192,87,0.2)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(64,192,87,0.15)' }}>
                  <Wallet size={20} style={{ color: 'var(--accent-green)' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--accent-green)' }}>Sisa Piutang</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--accent-green)' }}>
                {formatRupiah(Math.max(0, (stats?.totalPiutang || 0) - (stats?.totalPembayaranBulanIni || 0)))}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--slate-medium)' }}>
                {(stats?.totalTransaksi || 0) - (stats?.transaksiLunas || 0)} transaksi belum lunas
              </p>
            </div>
          </div>

          {/* Payment List */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--slate-dark)' }}>
              Daftar Pembayaran
            </h3>

            <div className="bg-white rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid rgba(183,192,201,0.4)' }}>
              {/* Header */}
              <div
                className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_120px] gap-4 px-6 py-3 text-xs font-medium uppercase tracking-[0.05em]"
                style={{ background: 'var(--surface-light)', color: 'var(--slate-medium)' }}
              >
                <span>Tanggal</span>
                <span>Mitra</span>
                <span className="text-right">Nominal</span>
                <span className="text-right">Dibayar</span>
                <span className="text-right">Sisa</span>
                <span>Status</span>
                <span></span>
              </div>

              {isLoading && (
                <div className="text-center py-12">
                  <div className="inline-block w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--slate-light)', borderTopColor: 'var(--deep-navy)' }} />
                  <p className="mt-2 text-sm" style={{ color: 'var(--slate-medium)' }}>Memuat data...</p>
                </div>
              )}

              {!isLoading && transactionsWithPayments.map((tx: any) => (
                <div
                  key={tx.id}
                  className="grid md:grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_120px] gap-4 px-6 py-4 items-center"
                  style={{ borderBottom: '1px solid rgba(183,192,201,0.2)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--slate-medium)' }}>{formatDate(tx.createdAt)}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--slate-dark)' }}>{tx.mitraNama}</span>
                  <span className="text-sm font-semibold text-right" style={{ color: 'var(--slate-dark)' }}>{formatRupiah(Number(tx.nominal))}</span>
                  <span className="text-sm text-right" style={{ color: 'var(--accent-green)' }}>{formatRupiah(tx.paid)}</span>
                  <span className="text-sm font-semibold text-right" style={{ color: 'var(--accent-coral)' }}>{formatRupiah(tx.remaining)}</span>
                  <div>{getStatusBadge(tx.status)}</div>
                  <div>
                    {tx.remaining > 0 && (
                      <button
                        onClick={() => openPaymentModal(tx)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.03]"
                        style={{ border: '1px solid var(--deep-navy)', color: 'var(--deep-navy)' }}
                      >
                        Catat Bayar
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {!isLoading && (!transactionsWithPayments || transactionsWithPayments.length === 0) && (
                <div className="text-center py-12">
                  <img src="/assets/empty-state.jpg" alt="Tidak ada data" className="w-40 h-auto mx-auto mb-4 opacity-60" />
                  <p className="text-sm font-medium" style={{ color: 'var(--slate-medium)' }}>Belum ada data pembayaran</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
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
      </div>

      {/* Record Payment Modal */}
      {modalOpen && selectedTx && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,48,73,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--slate-light)' }}>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--slate-dark)' }}>Catat Pembayaran</h3>
              <button onClick={() => { setModalOpen(false); setSelectedTx(null) }} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} style={{ color: 'var(--slate-medium)' }} />
              </button>
            </div>

            {/* Transaction Info */}
            <div className="mx-6 mt-4 rounded-lg p-4" style={{ background: 'var(--surface-light)' }}>
              <div className="text-sm space-y-1" style={{ color: 'var(--slate-dark)' }}>
                <p><span className="font-medium">Mitra:</span> {selectedTx.mitraNama}</p>
                <p><span className="font-medium">Tanggal:</span> {formatDate(selectedTx.createdAt)}</p>
                <p><span className="font-medium">Total:</span> {formatRupiah(Number(selectedTx.nominal))}</p>
                <p><span className="font-medium">Dibayar:</span> {formatRupiah(getPaidAmount(selectedTx.id))}</p>
                <p><span className="font-medium">Sisa:</span> {formatRupiah(selectedTx.remaining)}</p>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Jumlah Pembayaran (Rp) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--slate-medium)' }}>Rp</span>
                  <input
                    type="number"
                    value={formData.jumlahBayar}
                    onChange={(e) => setFormData({ ...formData, jumlahBayar: e.target.value })}
                    max={selectedTx.remaining}
                    className="w-full h-11 pl-12 pr-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                    style={{ borderColor: errors.jumlahBayar ? 'var(--accent-coral)' : 'var(--slate-light)', color: 'var(--slate-dark)' }}
                  />
                </div>
                {errors.jumlahBayar && <p className="mt-1 text-xs" style={{ color: 'var(--accent-coral)' }}>{errors.jumlahBayar}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Tanggal Pembayaran</label>
                <input
                  type="date"
                  value={formData.tanggalBayar}
                  onChange={(e) => setFormData({ ...formData, tanggalBayar: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                  style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Metode Pembayaran</label>
                <select
                  value={formData.metodePembayaran}
                  onChange={(e) => setFormData({ ...formData, metodePembayaran: e.target.value as any })}
                  className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] cursor-pointer"
                  style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                >
                  <option value="tunai">Tunai</option>
                  <option value="transfer_bank">Transfer Bank</option>
                  <option value="qris">QRIS</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

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
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--slate-light)' }}>
              <button
                onClick={() => { setModalOpen(false); setSelectedTx(null) }}
                className="px-5 h-10 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ border: '1px solid var(--slate-light)', color: 'var(--slate-medium)' }}
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={createPayment.isPending}
                className="px-5 h-10 rounded-lg text-sm font-semibold text-white transition-all hover:scale-[1.03] disabled:opacity-50"
                style={{ background: 'var(--accent-green)' }}
              >
                {createPayment.isPending ? 'Menyimpan...' : 'Simpan Pembayaran'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
