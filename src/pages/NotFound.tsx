import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--warm-ivory)' }}
    >
      <div className="text-center">
        <h1
          className="font-black"
          style={{
            color: 'var(--deep-navy)',
            fontSize: 'clamp(4rem, 15vw, 8rem)',
            lineHeight: 1,
            letterSpacing: '-0.04em',
          }}
        >
          404
        </h1>
        <p className="mt-2 text-lg font-medium" style={{ color: 'var(--slate-dark)' }}>
          Halaman tidak ditemukan
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--slate-medium)' }}>
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.03] hover:shadow-lg"
          style={{ background: 'var(--deep-navy)', color: 'var(--warm-ivory)' }}
        >
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}
