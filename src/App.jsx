import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- COMPONENTS UTILS ---
import Layout from './Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// --- PAGES ---
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';
import EventDetail from './pages/EventDetail';
import DivisiDetail from './pages/DivisiDetail';
import TentangKami from './pages/TentangKami';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      {/* ScrollToTop ditaruh di sini agar aktif di semua halaman */}
      <ScrollToTop />

      <Routes>
        
        {/* === RUTE PUBLIK (DENGAN NAVBAR & FOOTER) === */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tentang-kami" element={<TentangKami />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/divisi/:nama_divisi" element={<DivisiDetail />} />
        </Route>

        {/* === RUTE LOGIN (FULL SCREEN / TANPA NAVBAR) === */}
        <Route path="/login" element={<Login />} />

        {/* === RUTE ADMIN (DIPROTEKSI / DIGEMBOK) === */}
        {/* Hanya bisa diakses jika sudah login, jika belum akan ditendang ke /login */}
        <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<Admin />} />
        </Route>

        {/* === RUTE 404 (JIKA URL TIDAK DITEMUKAN) === */}
        {/* Menangkap semua link ngawur */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}

export default App;