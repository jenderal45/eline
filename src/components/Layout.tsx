import { Link, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  Receipt,
  CreditCard,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  X
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Ringkasan', icon: LayoutDashboard },
  { path: '/mitra', label: 'Daftar Mitra', icon: Users },
  { path: '/transaksi', label: 'Transaksi', icon: Receipt },
  { path: '/pembayaran', label: 'Pembayaran', icon: CreditCard },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setHeaderVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--warm-ivory)' }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-transform duration-600"
        style={{
          background: 'var(--deep-navy)',
          height: 64,
          transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
          transitionDuration: '0.6s',
        }}
      >
        <div className="flex items-center justify-between h-full px-4 lg:px-8 max-w-[1400px] mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{
                background: 'var(--accent-coral)',
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
            <span className="text-lg font-bold" style={{ color: 'var(--warm-ivory)' }}>
              KreditPulsa
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-3 py-2 text-sm font-semibold transition-opacity duration-200"
                style={{
                  color: 'var(--warm-ivory)',
                  opacity: isActive(item.path) ? 1 : 0.6,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                onMouseLeave={(e) => { if (!isActive(item.path)) e.currentTarget.style.opacity = '0.6' }}
              >
                {item.label}
                {isActive(item.path) && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ background: 'var(--accent-coral)' }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="relative p-1.5" style={{ color: 'var(--warm-ivory)' }}>
              <Bell size={20} />
              <span
                className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--accent-blue)' }}
              />
            </button>

            {/* User dropdown */}
            <div className="relative hidden md:block">
              <button
                className="flex items-center gap-2"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'var(--warm-ivory)', color: 'var(--deep-navy)' }}
                >
                  {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
                </div>
                <ChevronDown size={14} style={{ color: 'var(--warm-ivory)', opacity: 0.6 }} />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div
                    className="absolute right-0 top-10 z-50 w-48 rounded-lg shadow-lg py-1"
                    style={{ background: 'white', border: '1px solid var(--slate-light)' }}
                  >
                    <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--slate-light)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--slate-dark)' }}>
                        {user?.name || 'Admin'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--slate-medium)' }}>
                        {user?.email || 'admin@kreditpulsa.id'}
                      </p>
                    </div>
                    <button
                      onClick={() => { logout(); setDropdownOpen(false) }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--accent-coral)' }}
                    >
                      <LogOut size={14} />
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: 'var(--warm-ivory)' }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden absolute top-16 left-0 right-0 py-4 px-4"
            style={{ background: 'var(--deep-navy)' }}
          >
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      color: 'var(--warm-ivory)',
                      opacity: isActive(item.path) ? 1 : 0.7,
                      background: isActive(item.path) ? 'rgba(253,240,213,0.1)' : 'transparent',
                    }}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                )
              })}
              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold mt-2"
                style={{ color: 'var(--accent-coral)' }}
              >
                <LogOut size={18} />
                Keluar
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1" style={{ paddingTop: 64 }}>
        {children}
      </main>
    </div>
  )
}
