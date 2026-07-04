import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import Layout from '@/components/Layout'
import WaveCanvas from '@/components/WaveCanvas'
import {
  Users,
  Receipt,
  CreditCard,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart: any) {
    const { ctx, chartArea } = chart
    const { top, left, width, height } = chartArea
    const centerX = left + width / 2
    const centerY = top + height / 2

    ctx.save()
    ctx.font = '500 12px Inter, sans-serif'
    ctx.fillStyle = '#5C677D'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Total', centerX, centerY - 12)

    ctx.font = '700 16px Inter, sans-serif'
    ctx.fillStyle = '#1E1E24'
    ctx.fillText('Rp 28.3M', centerX, centerY + 8)
    ctx.restore()
  },
}

ChartJS.register(centerTextPlugin)

function formatRupiah(n: number): string {
  if (!n || isNaN(n)) return 'Rp 0'
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)}.${String(Math.floor((n % 1_000_000) / 100_000))}M`
  return `Rp ${n.toLocaleString('id-ID')}`
}

function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getAvatarColor(index: number): string {
  const colors = ['#FF6B6B', '#4DABF7', '#40C057', '#B7C0C9', '#FF6B6B', '#4DABF7']
  return colors[index % colors.length]
}

export default function Dashboard() {
  const { data: stats } = trpc.dashboard.stats.useQuery()
  const { data: recentTx } = trpc.dashboard.recentTransactions.useQuery()
  const { data: recentMitra } = trpc.dashboard.recentMitra.useQuery()
  const { data: txTrend } = trpc.dashboard.transactionTrend.useQuery()
  const { data: creditDist } = trpc.dashboard.creditDistribution.useQuery()

  const heroRef = useRef<HTMLDivElement>(null)
  const analyticsRef = useRef<HTMLDivElement>(null)
  const transactionsRef = useRef<HTMLDivElement>(null)
  const mitraRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    )

    const elements = document.querySelectorAll('.reveal')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [stats, recentTx, recentMitra, txTrend, creditDist])

  const trendChartData = {
    labels: txTrend?.map((t: any) => {
      const month = t.month.split('-')[1]
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
      return months[parseInt(month) - 1]
    }) || ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    datasets: [
      {
        data: txTrend?.map((t: any) => Number(t.total)) || [8500000, 11200000, 9800000, 13500000, 15200000, 18700000],
        borderColor: '#003049',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx
          const gradient = ctx.createLinearGradient(0, 0, 0, 320)
          gradient.addColorStop(0, 'rgba(0, 48, 73, 0.15)')
          gradient.addColorStop(1, 'rgba(0, 48, 73, 0)')
          return gradient
        },
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#003049',
        pointBorderColor: '#FDF0D5',
        pointBorderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#5C677D', font: { family: 'Inter', size: 12 } },
      },
      y: {
        grid: { color: 'rgba(183, 192, 201, 0.3)', drawBorder: false },
        ticks: {
          color: '#5C677D',
          font: { family: 'Inter', size: 12 },
          callback: (value: any) => `Rp ${(value / 1000000).toFixed(0)}M`,
        },
      },
    },
  }

  const doughnutData = {
    labels: creditDist?.map((c: any) => c.nama) || ['PT Sumber Pulsa', 'CV Digital Nusantara', 'Toko Makmur', 'Konter Jaya', 'Lainnya'],
    datasets: [
      {
        data: creditDist?.map((c: any) => Number(c.total)) || [8500000, 6200000, 4800000, 3500000, 5520000],
        backgroundColor: ['#003049', '#FF6B6B', '#4DABF7', '#B7C0C9', '#40C057'],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle' as const,
          padding: 16,
          font: { family: 'Inter', size: 12 },
        },
      },
      tooltip: { enabled: false },
    },
  }

  const sisaKredit = (limit: string, used: string) => {
    return Math.max(0, Number(limit) - Number(used))
  }

  const usagePercent = (limit: string, used: string) => {
    const l = Number(limit)
    const u = Number(used)
    if (!l) return 0
    return Math.min(100, Math.round((u / l) * 100))
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ background: 'var(--deep-navy)', minHeight: '70vh' }}
      >
        <WaveCanvas />
        {/* Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,48,73,0.6) 100%)',
            zIndex: 1,
          }}
        />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 lg:px-8 pt-24 pb-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left - Title */}
            <div className="lg:w-[55%] reveal" style={{ opacity: 0, transform: 'translateY(40px)' }}>
              <h1
                className="font-black tracking-tight"
                style={{
                  color: 'var(--warm-ivory)',
                  fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                  lineHeight: 0.95,
                  letterSpacing: '-0.02em',
                }}
              >
                Selamat Datang, Admin
              </h1>
              <p
                className="mt-4 text-base leading-relaxed"
                style={{ color: 'var(--warm-ivory)', opacity: 0.7, maxWidth: 520 }}
              >
                Pantau kredit, transaksi, dan pembayaran mitra konter pulsa Anda dalam satu dasbor.
              </p>

              {/* Quick stat overview mobile */}
              <div className="flex lg:hidden gap-3 mt-6 overflow-x-auto pb-2">
                <div className="min-w-[180px] rounded-xl p-4" style={{ background: 'var(--surface-dark)', border: '1px solid rgba(253,240,213,0.08)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--warm-ivory)', opacity: 0.5 }}>Total Dana Tersedia</p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--warm-ivory)' }}>{formatRupiah(stats?.totalDanaTersedia || 45750000)}</p>
                </div>
                <div className="min-w-[180px] rounded-xl p-4" style={{ background: 'var(--surface-dark)', border: '1px solid rgba(253,240,213,0.08)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--warm-ivory)', opacity: 0.5 }}>Total Kredit Aktif</p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--warm-ivory)' }}>{formatRupiah(stats?.totalKreditAktif || 28320000)}</p>
                </div>
                <div className="min-w-[180px] rounded-xl p-4" style={{ background: 'var(--surface-dark)', border: '1px solid rgba(253,240,213,0.08)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--warm-ivory)', opacity: 0.5 }}>Mitra Aktif</p>
                  <p className="text-xl font-semibold" style={{ color: 'var(--warm-ivory)' }}>{stats?.mitraAktif || 24} Konter</p>
                </div>
              </div>
            </div>

            {/* Right - Stat Cards */}
            <div className="hidden lg:flex lg:w-[45%] flex-col gap-3">
              {[
                { label: 'Total Dana Tersedia', value: stats?.totalDanaTersedia || 45750000, spark: [42, 43, 41, 44, 45, 46, 45.7], sparkColor: '#40C057', icon: TrendingUp },
                { label: 'Total Kredit Aktif', value: stats?.totalKreditAktif || 28320000, spark: [22, 24, 25, 26, 27, 28, 28.3], sparkColor: '#FF6B6B', icon: TrendingDown },
                { label: 'Mitra Aktif', value: null, text: `${stats?.mitraAktif || 24} Konter`, sub: '+3 bulan ini', icon: Users },
              ].map((card, i) => (
                <div
                  key={i}
                  className="reveal rounded-xl p-5"
                  style={{
                    background: 'var(--surface-dark)',
                    border: '1px solid rgba(253,240,213,0.08)',
                    opacity: 0,
                    transform: 'translateY(30px) scale(0.95)',
                    transitionDelay: `${i * 0.12}s`,
                  }}
                >
                  <p className="text-xs font-medium tracking-wide mb-2" style={{ color: 'var(--warm-ivory)', opacity: 0.5 }}>
                    {card.label}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-semibold" style={{ color: 'var(--warm-ivory)' }}>
                      {card.value !== null ? formatRupiah(card.value) : card.text}
                    </p>
                    {card.spark && (
                      <svg width="80" height="24" viewBox="0 0 80 24">
                        <polyline
                          points={card.spark.map((v, i) => `${i * (80 / (card.spark!.length - 1))},${24 - ((v - Math.min(...card.spark!)) / (Math.max(...card.spark!) - Math.min(...card.spark!))) * 20}`).join(' ')}
                          fill="none"
                          stroke={card.sparkColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {card.sub && (
                      <span className="text-xs font-medium" style={{ color: 'var(--accent-green)' }}>{card.sub}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Mitra Horizontal Scroll */}
          <div className="mt-10 reveal" style={{ opacity: 0, transform: 'translateY(30px)' }}>
            <p className="text-sm font-medium mb-4" style={{ color: 'var(--warm-ivory)', opacity: 0.6 }}>Mitra Terbaru</p>
            <div className="flex gap-3 overflow-x-auto pb-3">
              {(recentMitra || []).slice(0, 5).map((m: any) => (
                <div
                  key={m.id}
                  className="min-w-[240px] rounded-lg p-4 backdrop-blur-sm"
                  style={{ background: 'rgba(253,240,213,0.06)' }}
                >
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--warm-ivory)' }}>{m.nama}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--warm-ivory)', opacity: 0.4 }}>{m.alamat?.slice(0, 30) || '-'}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--warm-ivory)', opacity: 0.5 }}>Kredit</span>
                      <span style={{ color: 'var(--warm-ivory)' }}>{usagePercent(m.limitKredit, m.kreditTerpakai)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(253,240,213,0.1)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${usagePercent(m.limitKredit, m.kreditTerpakai)}%`,
                          background: 'var(--accent-coral)',
                        }}
                      />
                    </div>
                  </div>
                  <Link
                    to="/mitra"
                    className="inline-flex items-center gap-1 mt-3 text-xs font-medium transition-opacity hover:opacity-80"
                    style={{ color: 'var(--accent-blue)' }}
                  >
                    Lihat Detail <ArrowRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section style={{ background: 'var(--warm-ivory)', padding: '2.5rem 0' }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 flex flex-wrap gap-3 justify-center">
          <Link
            to="/mitra"
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
            style={{ background: 'var(--deep-navy)', color: 'var(--warm-ivory)' }}
          >
            <Users size={16} /> + Tambah Mitra
          </Link>
          <Link
            to="/transaksi"
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
            style={{ background: 'var(--accent-coral)', color: 'white' }}
          >
            <Receipt size={16} /> + Catat Transaksi
          </Link>
          <Link
            to="/pembayaran"
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-[1.03]"
            style={{ border: '2px solid var(--deep-navy)', color: 'var(--deep-navy)' }}
          >
            <CreditCard size={16} /> Catat Pembayaran
          </Link>
          <Link
            to="/transaksi"
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-[1.03]"
            style={{ border: '2px solid var(--deep-navy)', color: 'var(--deep-navy)' }}
          >
            <FileText size={16} /> Lihat Laporan
          </Link>
        </div>
      </section>

      {/* Analytics */}
      <section ref={analyticsRef} style={{ background: 'var(--warm-ivory)', padding: '5rem 0' }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-[55%_45%] gap-8">
            {/* Transaction Trend */}
            <div className="reveal" style={{ opacity: 0, transform: 'translateX(-40px)' }}>
              <p className="text-xs font-medium tracking-[0.08em] mb-2" style={{ color: 'var(--slate-medium)' }}>TREN TRANSAKSI</p>
              <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--slate-dark)', letterSpacing: '-0.01em' }}>
                Volume Transaksi 6 Bulan Terakhir
              </h2>
              <div className="bg-white rounded-xl p-4 shadow-sm" style={{ height: 320 }}>
                <Line data={trendChartData} options={trendChartOptions} />
              </div>
            </div>

            {/* Credit Distribution */}
            <div className="reveal" style={{ opacity: 0, transform: 'translateX(40px)' }}>
              <p className="text-xs font-medium tracking-[0.08em] mb-2" style={{ color: 'var(--slate-medium)' }}>DISTRIBUSI KREDIT</p>
              <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--slate-dark)', letterSpacing: '-0.01em' }}>
                Penggunaan Kredit per Mitra
              </h2>
              <div className="bg-white rounded-xl p-4 shadow-sm" style={{ height: 320 }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section
        ref={transactionsRef}
        style={{
          background: 'var(--warm-ivory)',
          padding: '5rem 0',
          borderTop: '1px solid rgba(183,192,201,0.3)',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--slate-dark)', letterSpacing: '-0.01em' }}>
              Transaksi Terbaru
            </h2>
            <Link
              to="/transaksi"
              className="flex items-center gap-1 text-sm font-medium transition-all hover:gap-2"
              style={{ color: 'var(--accent-blue)' }}
            >
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            {/* Table Header */}
            <div
              className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-3 text-xs font-medium uppercase tracking-[0.05em]"
              style={{ background: 'var(--surface-light)', color: 'var(--slate-medium)' }}
            >
              <span>Tanggal</span>
              <span>Mitra</span>
              <span>Tipe</span>
              <span className="text-right">Nominal</span>
              <span className="text-right">Status</span>
            </div>

            {/* Table Rows */}
            {(recentTx || []).map((tx: any, i: number) => (
              <div
                key={tx.id}
                className="reveal grid md:grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center transition-colors duration-200 hover:bg-[#F8F9FA]"
                style={{
                  borderBottom: '1px solid rgba(183,192,201,0.2)',
                  opacity: 0,
                  transform: 'translateY(20px)',
                  transitionDelay: `${i * 0.08}s`,
                }}
              >
                <span className="text-sm" style={{ color: 'var(--slate-medium)' }}>{formatDate(tx.createdAt)}</span>
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: getAvatarColor(tx.mitraId) }}
                  >
                    {getInitials(tx.mitraNama || 'M')}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--slate-dark)' }}>{tx.mitraNama}</span>
                </div>
                <span
                  className="inline-flex px-3 py-0.5 rounded-full text-xs font-medium w-fit"
                  style={{
                    background: tx.tipe === 'pulsa' ? 'rgba(77,171,247,0.15)' : 'rgba(255,107,107,0.15)',
                    color: tx.tipe === 'pulsa' ? 'var(--accent-blue)' : 'var(--accent-coral)',
                  }}
                >
                  {tx.tipe === 'pulsa' ? 'Pulsa' : 'Paket Data'}
                </span>
                <span className="text-sm font-semibold text-right" style={{ color: 'var(--slate-dark)' }}>
                  {formatRupiah(Number(tx.nominal))}
                </span>
                <span className="flex justify-end">
                  <span
                    className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: tx.statusPembayaran === 'lunas' ? 'rgba(64,192,87,0.15)' : 'rgba(255,107,107,0.15)',
                      color: tx.statusPembayaran === 'lunas' ? 'var(--accent-green)' : 'var(--accent-coral)',
                    }}
                  >
                    {tx.statusPembayaran === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mitra Overview */}
      <section ref={mitraRef} style={{ background: 'var(--deep-navy)', padding: '6rem 0' }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="reveal" style={{ opacity: 0 }}>
            <h2 className="text-3xl font-semibold" style={{ color: 'var(--warm-ivory)', letterSpacing: '-0.01em' }}>
              Mitra Konter Pulsa
            </h2>
            <p className="mt-2 text-base max-w-[480px]" style={{ color: 'var(--warm-ivory)', opacity: 0.6 }}>
              Kelola dan pantau semua mitra konter pulsa Anda.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {(recentMitra || []).slice(0, 6).map((m: any, i: number) => (
              <div
                key={m.id}
                className="reveal rounded-xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'var(--surface-dark)',
                  border: '1px solid rgba(253,240,213,0.06)',
                  opacity: 0,
                  transform: 'translateY(40px) scale(0.96)',
                  transitionDelay: `${i * 0.1}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Card top */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: getAvatarColor(i) }}
                  >
                    {getInitials(m.nama)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--warm-ivory)' }}>{m.nama}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--warm-ivory)', opacity: 0.4 }}>{m.alamat?.slice(0, 35) || '-'}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--warm-ivory)', opacity: 0.5 }}>Limit</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--warm-ivory)' }}>{formatRupiah(Number(m.limitKredit))}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--warm-ivory)', opacity: 0.5 }}>Terpakai</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--warm-ivory)' }}>{formatRupiah(Number(m.kreditTerpakai))}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--warm-ivory)', opacity: 0.5 }}>Sisa</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--accent-green)' }}>{formatRupiah(sisaKredit(m.limitKredit, m.kreditTerpakai))}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(253,240,213,0.1)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${usagePercent(m.limitKredit, m.kreditTerpakai)}%`,
                        background: `linear-gradient(90deg, var(--accent-coral), var(--accent-blue))`,
                      }}
                    />
                  </div>
                  <span className="text-xs shrink-0" style={{ color: 'var(--warm-ivory)', opacity: 0.5 }}>
                    {usagePercent(m.limitKredit, m.kreditTerpakai)}%
                  </span>
                </div>

                {/* Footer */}
                <Link
                  to="/mitra"
                  className="inline-flex items-center gap-1 mt-4 text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ color: 'var(--accent-blue)' }}
                >
                  Lihat Detail <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--deep-navy)', borderTop: '1px solid rgba(253,240,213,0.08)', padding: '3rem 0 2rem' }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: 'var(--accent-coral)' }}
              />
              <span className="text-sm font-bold" style={{ color: 'var(--warm-ivory)' }}>KreditPulsa</span>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--warm-ivory)', opacity: 0.5 }}>
              <Link to="/" className="hover:opacity-100 transition-opacity">Ringkasan</Link>
              <Link to="/mitra" className="hover:opacity-100 transition-opacity">Mitra</Link>
              <Link to="/transaksi" className="hover:opacity-100 transition-opacity">Transaksi</Link>
              <Link to="/pembayaran" className="hover:opacity-100 transition-opacity">Pembayaran</Link>
            </div>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--warm-ivory)', opacity: 0.5 }}>
              <span>Bantuan</span>
              <span>Kebijakan Privasi</span>
            </div>
          </div>
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(253,240,213,0.08)' }}>
            <p className="text-center text-xs" style={{ color: 'var(--warm-ivory)', opacity: 0.3 }}>
              2025 KreditPulsa. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        .reveal.revealed {
          opacity: 1 !important;
          transform: translateY(0) translateX(0) scale(1) !important;
          transition: opacity 0.8s cubic-bezier(0.215, 0.61, 0.355, 1),
                      transform 0.8s cubic-bezier(0.215, 0.61, 0.355, 1);
        }
      `}</style>
    </Layout>
  )
}
