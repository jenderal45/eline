import { useState } from 'react'
import Layout from '@/components/Layout'
import {
  User,
  Building2,
  Bell,
  Shield,
  Save,
} from 'lucide-react'

const settingTabs = [
  { key: 'profil', label: 'Profil', icon: User },
  { key: 'platform', label: 'Platform', icon: Building2 },
  { key: 'notifikasi', label: 'Notifikasi', icon: Bell },
  { key: 'keamanan', label: 'Keamanan', icon: Shield },
]

export default function Pengaturan() {
  const [activeTab, setActiveTab] = useState('profil')
  const [saved, setSaved] = useState(false)

  const [profileForm, setProfileForm] = useState({
    nama: 'Admin KreditPulsa',
    nomorHp: '+62 812-3456-7890',
    email: 'admin@kreditpulsa.id',
  })

  const [platformForm, setPlatformForm] = useState({
    namaPlatform: 'KreditPulsa',
    mataUang: 'IDR',
    limitDefault: '2000000',
    bunga: '0',
    durasi: '30',
  })

  const [notifSettings, setNotifSettings] = useState({
    email: true,
    whatsapp: false,
    maintenance: false,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Layout>
      <div className="min-h-screen" style={{ background: 'var(--warm-ivory)' }}>
        <div className="max-w-[960px] mx-auto px-4 lg:px-8 py-8">
          {/* Page Header */}
          <h1 className="text-3xl font-bold" style={{ color: 'var(--slate-dark)', letterSpacing: '-0.02em' }}>
            Pengaturan
          </h1>
          <p className="mt-2 text-base" style={{ color: 'var(--slate-medium)' }}>
            Kelola pengaturan akun dan platform Anda.
          </p>

          {/* Layout: Sidebar + Content */}
          <div className="flex flex-col md:flex-row gap-6 mt-8">
            {/* Sidebar */}
            <div className="md:w-[240px] shrink-0">
              <nav className="flex md:flex-col gap-1">
                {settingTabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: activeTab === tab.key ? 'var(--deep-navy)' : 'transparent',
                        color: activeTab === tab.key ? 'var(--warm-ivory)' : 'var(--slate-medium)',
                      }}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 bg-white rounded-xl p-6 shadow-sm" style={{ border: '1px solid rgba(183,192,201,0.4)' }}>
              {/* Saved indicator */}
              {saved && (
                <div className="mb-4 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'rgba(64,192,87,0.15)', color: 'var(--accent-green)' }}>
                  Perubahan berhasil disimpan!
                </div>
              )}

              {/* Profil Tab */}
              {activeTab === 'profil' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--slate-dark)' }}>Profil Admin</h3>

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                      style={{ background: 'var(--deep-navy)', color: 'var(--warm-ivory)' }}
                    >
                      {profileForm.nama.slice(0, 2).toUpperCase()}
                    </div>
                    <button
                      className="text-sm font-medium transition-opacity hover:opacity-80"
                      style={{ color: 'var(--accent-blue)' }}
                    >
                      Ubah Foto
                    </button>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Nama Lengkap</label>
                        <input
                          type="text"
                          value={profileForm.nama}
                          onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
                          className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                          style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Nomor HP</label>
                        <input
                          type="tel"
                          value={profileForm.nomorHp}
                          onChange={(e) => setProfileForm({ ...profileForm, nomorHp: e.target.value })}
                          className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                          style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Email</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                        style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Platform Tab */}
              {activeTab === 'platform' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--slate-dark)' }}>Pengaturan Platform</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Nama Platform</label>
                      <input
                        type="text"
                        value={platformForm.namaPlatform}
                        onChange={(e) => setPlatformForm({ ...platformForm, namaPlatform: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                        style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Mata Uang</label>
                      <select
                        value={platformForm.mataUang}
                        onChange={(e) => setPlatformForm({ ...platformForm, mataUang: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] cursor-pointer"
                        style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                      >
                        <option value="IDR">Rupiah (IDR)</option>
                      </select>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Batas Kredit Default (Rp)</label>
                        <input
                          type="number"
                          value={platformForm.limitDefault}
                          onChange={(e) => setPlatformForm({ ...platformForm, limitDefault: e.target.value })}
                          className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                          style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Persentase Bunga (%)</label>
                        <input
                          type="number"
                          value={platformForm.bunga}
                          onChange={(e) => setPlatformForm({ ...platformForm, bunga: e.target.value })}
                          className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                          style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Durasi Kredit (Hari)</label>
                        <input
                          type="number"
                          value={platformForm.durasi}
                          onChange={(e) => setPlatformForm({ ...platformForm, durasi: e.target.value })}
                          className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                          style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifikasi Tab */}
              {activeTab === 'notifikasi' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--slate-dark)' }}>Pengaturan Notifikasi</h3>

                  <div className="space-y-4">
                    {[
                      { key: 'email' as const, label: 'Notifikasi Email', desc: 'Terima notifikasi melalui email' },
                      { key: 'whatsapp' as const, label: 'Notifikasi WhatsApp', desc: 'Terima notifikasi melalui WhatsApp' },
                      { key: 'maintenance' as const, label: 'Mode Maintenance', desc: 'Aktifkan mode maintenance platform' },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 rounded-lg"
                        style={{ background: 'var(--surface-light)' }}
                      >
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--slate-dark)' }}>{item.label}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--slate-medium)' }}>{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifSettings({ ...notifSettings, [item.key]: !notifSettings[item.key] })}
                          className="relative w-11 h-6 rounded-full transition-colors duration-200"
                          style={{ background: notifSettings[item.key] ? 'var(--accent-green)' : 'var(--slate-light)' }}
                        >
                          <span
                            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                            style={{ left: notifSettings[item.key] ? 22 : 2 }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keamanan Tab */}
              {activeTab === 'keamanan' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--slate-dark)' }}>Keamanan</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Password Saat Ini</label>
                      <input
                        type="password"
                        className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                        style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                        placeholder="Masukkan password saat ini"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Password Baru</label>
                      <input
                        type="password"
                        className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                        style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                        placeholder="Masukkan password baru"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--slate-dark)' }}>Konfirmasi Password Baru</label>
                      <input
                        type="password"
                        className="w-full h-11 px-4 rounded-lg text-sm border outline-none focus:border-[var(--deep-navy)] transition-colors"
                        style={{ borderColor: 'var(--slate-light)', color: 'var(--slate-dark)' }}
                        placeholder="Konfirmasi password baru"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(183,192,201,0.3)' }}>
                <button
                  onClick={handleSave}
                  className="h-11 px-6 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:scale-[1.03] hover:shadow-lg"
                  style={{ background: 'var(--deep-navy)', color: 'var(--warm-ivory)' }}
                >
                  <Save size={16} /> Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
