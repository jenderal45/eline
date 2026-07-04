import { Routes, Route } from 'react-router'
import Dashboard from './pages/Dashboard'
import DaftarMitra from './pages/DaftarMitra'
import Transaksi from './pages/Transaksi'
import Pembayaran from './pages/Pembayaran'
import Pengaturan from './pages/Pengaturan'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/mitra" element={<DaftarMitra />} />
      <Route path="/transaksi" element={<Transaksi />} />
      <Route path="/pembayaran" element={<Pembayaran />} />
      <Route path="/pengaturan" element={<Pengaturan />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
