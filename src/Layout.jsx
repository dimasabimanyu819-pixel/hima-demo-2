import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';

// --- UTILS: TILT CARD ---
function TiltCard({ children, className = "", onClick, noPadding = false }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });
  
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-12deg", "12deg"]);
  const glowX = useTransform(mouseX, [-0.5, 0.5], ["-25%", "25%"]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], ["-25%", "25%"]);
  const brightness = useTransform(mouseY, [-0.5, 0.5], [1, 1.05]);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleMouseLeave() { x.set(0); y.set(0); }

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative group/tilt z-0 perspective-1000 ${className}`}
    >
      <motion.div
        style={{ x: glowX, y: glowY, transform: "translateZ(-50px)" }}
        className="absolute -inset-8 bg-gradient-to-r from-purple-600/30 via-cyan-500/30 to-purple-600/30 rounded-[3rem] blur-3xl opacity-0 group-hover/tilt:opacity-70 transition-opacity duration-500 -z-20"
      />
      <motion.div 
         style={{ filter: `brightness(${brightness})` }}
         className={`relative h-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 overflow-hidden rounded-3xl transition-colors duration-300 shadow-xl dark:shadow-none ${noPadding ? '' : 'p-8'}`}
      >
         <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent dark:from-white/10 dark:to-transparent opacity-0 group-hover/tilt:opacity-100 transition duration-500 pointer-events-none z-10"></div>
         {children}
      </motion.div>
    </motion.div>
  );
}

// --- ICONS ---
const Icons = {
  Instagram: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  TikTok: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.49-3.35-3.98-5.6-.48-2.24.12-4.55 1.5-6.4.32-.42.69-.81 1.11-1.14 1.97-1.57 4.72-1.43 6.56.29.05.05.09.1.14.14v4.04c-1.2-.87-2.91-.85-4.08-.07-.77.51-1.23 1.36-1.23 2.27 0 1.65 1.36 3.01 3.03 2.99 1.62-.03 2.94-1.35 2.95-2.98v-16.48z"/></svg>,
  YouTube: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>,
  Mail: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
  Location: () => <svg className="w-6 h-6 text-purple-600 dark:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  Building: () => <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>,
  Sun: () => <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Moon: () => <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  Whatsapp: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>,
};

export default function Layout() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
  const [profil, setProfil] = useState({ nama: "Loading...", logo_url: "", instagram: "", tiktok: "", youtube: "", email: "" });
  const BASE_URL = "http://localhost/himpunan-api/api.php";
  
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const p = await axios.get(`${BASE_URL}?action=get_profil`);
        if (p.data) setProfil(p.data);
      } catch (err) {}
    };
    fetchProfil();
  }, []);

  const safeLink = (url) => { if (!url) return null; let clean = url.toString().trim(); return clean.startsWith('http') ? clean : `https://${clean}`; };

  const divisiList = [
      { name: "BPH Inti", slug: "bph" }, { name: "Riset & Teknologi", slug: "iptek" }, { name: "Media Kreatif", slug: "kominfo" },
      { name: "Pengembangan SDM", slug: "psdm" }, { name: "Hubungan Publik", slug: "humas" }, { name: "Dana Usaha", slug: "danus" }
  ];

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="font-sans text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-[#050505] min-h-screen selection:bg-purple-500/30 selection:text-purple-900 dark:selection:text-purple-200 overflow-x-hidden transition-colors duration-300 flex flex-col">
        
        {/* GLOBAL BACKGROUND */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.03] opacity-5"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/40 dark:bg-purple-900/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-200/40 dark:bg-indigo-900/10 blur-[120px] rounded-full"></div>
        </div>

        {/* NAVBAR */}
        <motion.nav 
          initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "circOut" }}
          className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
        >
          <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-full px-6 py-3 shadow-lg dark:shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              {profil.logo_url && <img src={profil.logo_url} className="h-8 w-8 object-contain group-hover:rotate-12 transition duration-500" alt="Logo"/>}
              <span className="font-bold text-lg tracking-tight text-gray-800 dark:text-white hidden md:block">{profil.nama_himpunan}</span>
            </Link>
            
            <ul className="flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-zinc-400">
              <li><Link to="/" className="hover:text-purple-600 dark:hover:text-white transition">Beranda</Link></li>
              <li className="hidden md:block"><Link to="/tentang-kami" className="hover:text-purple-600 dark:hover:text-white transition">Tentang Kami</Link></li>
              
              <li className="relative group cursor-pointer h-full py-2">
                  <span className="hover:text-purple-600 dark:hover:text-white transition flex items-center gap-1">Divisi</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden hidden group-hover:block shadow-xl p-1">
                      {divisiList.map((div, i) => (
                          <Link key={i} to={`/divisi/${div.slug}`} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-white transition text-xs">
                              {div.name}
                          </Link>
                      ))}
                  </div>
              </li>
              <li><a href="#event" className="hover:text-purple-600 dark:hover:text-white transition">Event</a></li>
              <li><a href="#gallery" className="hover:text-purple-600 dark:hover:text-white transition">Galeri</a></li>
            </ul>

            <div className="flex items-center gap-4">
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition">
                    {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
                </button>
                <Link to="/login" className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-full text-xs font-bold hover:opacity-80 transition shadow-lg">
                  Member
                </Link>
            </div>
          </div>
        </motion.nav>

        {/* CONTENT UTAMA */}
        <main className="flex-grow pt-24 min-h-screen">
            <Outlet context={{ isDarkMode }} />
        </main>

        {/* FOOTER */}
        <footer className="bg-white dark:bg-[#020202] text-gray-500 dark:text-zinc-500 py-16 border-t border-gray-200 dark:border-white/5 text-sm transition-colors duration-300 mt-auto">
           <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 border-b border-gray-200 dark:border-zinc-900 pb-12">
                  {/* PETA (Google Map UNIS) */}
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-zinc-800 h-64 relative group">
                      <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.505736737568!2d106.63435431476906!3d-6.196806995513812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f9291771151d%3A0x2863955655380596!2sUniversitas%20Islam%20Syekh-Yusuf%20(UNIS)%20Tangerang!5e0!3m2!1sid!2sid!4v1679000000000!5m2!1sid!2sid" 
                        width="100%" height="100%" style={{border:0}} allowFullScreen="" loading="lazy" 
                        className="grayscale group-hover:grayscale-0 transition duration-700"
                      ></iframe>
                  </div>
                  <div className="flex flex-col justify-center">
                      <h2 className="text-3xl font-black mb-4 uppercase tracking-wide text-gray-900 dark:text-white">Universitas Islam Syekh-Yusuf</h2>
                      <p className="text-gray-600 dark:text-zinc-500 mb-8 leading-relaxed">Universitas Islam Syekh-Yusuf (UNIS) Tangerang merupakan perguruan tinggi Islam pertama di Banten yang berdiri sejak tahun 1966. Berkomitmen mencetak sarjana berakhlakul karimah.</p>
                      <h3 className="text-lg font-bold mb-4 text-purple-600 dark:text-purple-500 flex items-center gap-2"><Icons.Location /> Lokasi Kampus</h3>
                      <div className="space-y-6">
                          <div className="bg-gray-100 dark:bg-zinc-900/30 p-4 rounded-xl border border-gray-200 dark:border-white/5"><h4 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2 text-sm"><Icons.Building /> Kampus Pusat (Babakan)</h4><p className="text-gray-600 dark:text-zinc-500 text-xs">Jl. Maulana Yusuf No.10, Babakan, Kec. Tangerang, Kota Tangerang, Banten 15118</p></div>
                          <div className="bg-gray-100 dark:bg-zinc-900/30 p-4 rounded-xl border border-gray-200 dark:border-white/5"><h4 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2 text-sm"><Icons.Building /> Fakultas Teknik & Komputer</h4><p className="text-gray-600 dark:text-zinc-500 text-xs">Gedung Pascasarjana & Laboratorium Komputer Terpadu.</p></div>
                      </div>
                  </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between gap-12">
                  <div className="md:w-1/3">
                      <div className="flex items-center gap-3 mb-6">
                        {profil.logo_url && <img src={profil.logo_url} className="w-10 h-10 object-contain" alt="Logo"/>}
                        <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">{profil.nama_himpunan}</span>
                      </div>
                      <p className="leading-relaxed mb-6 text-gray-600 dark:text-gray-500">Mewadahi aspirasi dan kreativitas mahasiswa Teknik Informatika UNIS Tangerang.</p>
                      <div className="flex gap-4">
                          {safeLink(profil.instagram) && <a href={safeLink(profil.instagram)} target="_blank" className="p-2 bg-gray-200 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"><Icons.Instagram /></a>}
                          {safeLink(profil.tiktok) && <a href={safeLink(profil.tiktok)} target="_blank" className="p-2 bg-gray-200 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"><Icons.TikTok /></a>}
                          {safeLink(profil.youtube) && <a href={safeLink(profil.youtube)} target="_blank" className="p-2 bg-gray-200 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"><Icons.YouTube /></a>}
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-12">
                      <div>
                          <h4 className="text-gray-900 dark:text-white font-bold mb-6">Kontak</h4>
                          <ul className="space-y-4">
                              <li className="flex items-center gap-2"><Icons.Mail /> hima@unis.ac.id</li>
                              <li className="flex items-center gap-2"><Icons.Whatsapp /> +62 812-3456-7890</li>
                          </ul>
                      </div>
                  </div>
              </div>
              <div className="border-t border-gray-200 dark:border-white/5 mt-16 pt-8 text-center text-xs text-gray-500 dark:text-zinc-600">
                  © 2026 {profil.nama_himpunan}. Support by @WebOrganisasi.
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
}