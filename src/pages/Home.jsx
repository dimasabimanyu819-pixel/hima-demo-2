import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

// --- UTILS: TILT CARD ---
function TiltCard({ children, className = "", onClick, noPadding = false }) {
  const x = useMotionValue(0); const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 }); const mouseY = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["12deg", "-12deg"]); const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-12deg", "12deg"]);
  const glowX = useTransform(mouseX, [-0.5, 0.5], ["-25%", "25%"]); const glowY = useTransform(mouseY, [-0.5, 0.5], ["-25%", "25%"]);
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
      <motion.div style={{ x: glowX, y: glowY, transform: "translateZ(-50px)" }} className="absolute -inset-8 bg-gradient-to-r from-purple-600/30 via-cyan-500/30 to-purple-600/30 rounded-[3rem] blur-3xl opacity-0 group-hover/tilt:opacity-70 transition-opacity duration-500 -z-20" />
      <motion.div style={{ filter: `brightness(${brightness})` }} className={`relative h-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 overflow-hidden rounded-3xl transition-colors duration-300 shadow-xl dark:shadow-none ${noPadding ? '' : 'p-8'}`}>
         <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent dark:from-white/10 dark:to-transparent opacity-0 group-hover/tilt:opacity-100 transition duration-500 pointer-events-none z-10"></div>
         {children}
      </motion.div>
    </motion.div>
  );
}

// --- ICONS ---
const Icons = {
  ArrowRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>,
  Bolt: () => <svg className="w-6 h-6 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Users: () => <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  Calendar: () => <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
};

export default function Home() {
  const navigate = useNavigate();
  const BASE_URL = "http://localhost/himpunan-api/api.php";
  
  const [profil, setProfil] = useState({ nama_himpunan: "Loading...", logo_url: "", visi: "", misi: "" });
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  
  // STATE SLIDESHOW BACKGROUND
  const [bgIndex, setBgIndex] = useState(0);
  
  // STATE FORM ASPIRASI
  const [formWA, setFormWA] = useState({ 
      nama: "", 
      telepon: "", 
      angkatan: "2024", 
      jenis: "Kritik", 
      pesan: "" 
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const p = await axios.get(`${BASE_URL}?action=get_profil`); 
        if (p.data) setProfil(p.data);
        
        const e = await axios.get(`${BASE_URL}?action=get_events`); 
        setEvents(Array.isArray(e.data) ? e.data : []);
        
        const g = await axios.get(`${BASE_URL}?action=get_gallery`); 
        setGallery(Array.isArray(g.data) ? g.data : []);
      } catch (err) {}
    };
    fetchAll();
  }, []);

  // EFEK GANTI BACKGROUND OTOMATIS (SETIAP 5 DETIK)
  useEffect(() => {
    if (gallery.length > 1) {
        const interval = setInterval(() => {
            setBgIndex((prevIndex) => (prevIndex + 1) % gallery.length);
        }, 5000); 
        return () => clearInterval(interval);
    }
  }, [gallery]);

  const handleKirimWA = (e) => { 
      e.preventDefault(); 
      const text = `Halo Admin, Saya ingin menyampaikan aspirasi:%0A%0A *Nama:* ${formWA.nama}%0A *No. HP:* ${formWA.telepon || '-' }%0A *Angkatan:* ${formWA.angkatan}%0A *Jenis:* ${formWA.jenis}%0A%0A *Pesan:*%0A${formWA.pesan}`; 
      window.open(`https://wa.me/6285171695356?text=${text}`, '_blank'); 
  };

  const divisiList = [ { name: "BPH Inti", slug: "bph" }, { name: "Riset & Teknologi", slug: "iptek" }, { name: "Media Kreatif", slug: "kominfo" }, { name: "Pengembangan SDM", slug: "psdm" }, { name: "Hubungan Publik", slug: "humas" }, { name: "Dana Usaha", slug: "danus" } ];
  const stats = [ { label: "Anggota Aktif", value: "150+", icon: <Icons.Users /> }, { label: "Event Terlaksana", value: "45+", icon: <Icons.Calendar /> }, { label: "Tahun Berdiri", value: "2008", icon: <Icons.Bolt /> } ];
  
  const faqs = [ 
      { q: "Kapan Open Recruitment dibuka?", a: "Biasanya kami membuka pendaftaran anggota baru setiap awal semester ganjil (September). Pantau Instagram kami untuk info tanggal pastinya!" },
      { q: "Apakah mengganggu kuliah?", a: "Tidak dong! Kami menerapkan manajemen waktu yang baik. Justru di sini kamu belajar mengatur waktu antara akademik dan organisasi." }, 
      { q: "Apa benefit jadi pengurus?", a: "Selain networking dan teman baru, kamu akan dapat soft-skill leadership, manajemen proyek, dan akses prioritas ke event-event teknologi." },
      { q: "Mahasiswa baru boleh ikut?", a: "Sangat boleh! Justru ini saat yang tepat untuk membangun relasi sejak dini. Syarat utamanya hanya kemauan untuk belajar." }
  ];

  return (
    <>
      {/* HERO SECTION (UPDATED: BLUR DIKURANGI JADI 6px) */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <AnimatePresence mode='wait'>
                 <motion.img 
                    key={bgIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }} 
                    src={gallery.length > 0 ? gallery[bgIndex].foto_url : "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1920&q=80"}
                    // PERUBAHAN DI SINI: blur-[6px] (sebelumnya 20px). scale juga sedikit dikurangi agar lebih tajam.
                    className="absolute inset-0 w-full h-full object-cover blur-[6px] scale-105 saturate-125"
                    alt="Background Slideshow"
                 />
             </AnimatePresence>
            
            <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-[2px] z-10"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 dark:from-[#050505] to-transparent z-10"></div>
        </div>

        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="relative z-20 max-w-4xl mx-auto pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/50 bg-black/40 text-purple-200 text-[10px] font-bold tracking-widest uppercase mb-6 shadow-lg backdrop-blur-md">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span></span> Official Website 2026
          </div>
          
          {profil.logo_url && (
              <img src={profil.logo_url} className="w-24 h-24 object-contain mx-auto mb-6 drop-shadow-2xl animate-pulse-slow" alt="Logo Himpunan" />
          )}

          <h1 className="text-6xl md:text-9xl font-black mb-6 tracking-tighter text-white leading-[0.9] drop-shadow-2xl">KABINET <br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500">SAMUHITA</span></h1>
          
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed font-light drop-shadow-md">
            Bergabunglah dalam ekosistem <span className="font-bold text-white">{profil.nama_himpunan}</span>. Tempat di mana baris kode bertemu dengan inovasi nyata.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link to="/tentang-kami" className="group relative px-8 py-4 bg-white text-black rounded-full font-bold overflow-hidden transition-all hover:scale-105 shadow-xl">
                  <span className="relative z-10 flex items-center gap-2">Jelajahi Kami <Icons.ArrowRight /></span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-cyan-200 opacity-0 group-hover:opacity-100 transition duration-300"></div>
              </Link>
              <a href="#event" className="px-8 py-4 rounded-full font-bold border border-white/30 bg-black/20 backdrop-blur-md hover:bg-white/10 transition text-white">Lihat Kegiatan</a>
          </div>
        </motion.div>

        <div className="absolute bottom-0 w-full overflow-hidden border-t border-white/10 bg-black/40 backdrop-blur-md py-4 z-20">
            <motion.div animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }} className="flex gap-12 whitespace-nowrap opacity-80">
                {[...divisiList, ...divisiList, ...divisiList].map((d, i) => (<span key={i} className="text-sm font-mono uppercase tracking-widest text-gray-300 flex items-center gap-4"><span className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"></span> {d.name}</span>))}
            </motion.div>
        </div>
      </section>

      {/* STATS */}
      <motion.section className="py-24 px-4 container mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                  <motion.div key={i} variants={fadeInUp}>
                      <TiltCard className="text-center">
                          <div className="w-12 h-12 mx-auto bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-gray-900 dark:text-white shadow-md">{stat.icon}</div>
                          <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">{stat.value}</h3>
                          <p className="text-gray-500 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                      </TiltCard>
                  </motion.div>
              ))}
          </div>
      </motion.section>

      {/* SAMBUTAN KETUA */}
      <motion.section className="py-24 px-4 bg-gray-100/50 dark:bg-zinc-900/20 border-y border-gray-200 dark:border-white/5" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp}>
          <div className="container mx-auto flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 w-full flex justify-center">
                  <TiltCard noPadding className="w-full max-w-md aspect-[4/5]">
                      <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover grayscale group-hover/tilt:grayscale-0 transition duration-500" alt="Ketua Himpunan"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 text-left z-10"><p className="text-white text-xl font-bold">Nama Ketua</p><p className="text-zinc-300 text-sm">Ketua Umum 2025/2026</p></div>
                  </TiltCard>
              </div>
              <div className="md:w-1/2 w-full text-left">
                  <h4 className="text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest mb-3 text-sm">Kata Sambutan</h4>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">Grow Together, <br/>Code Forever.</h2>
                  <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-lg mb-8">"Di sini bukan cuma tempat ngoding, tapi tempat kita nemuin keluarga baru. Kita percaya teknologi bisa jadi seru kalau dipelajari bareng-bareng. Ayo buat sesuatu yang keren dan bermanfaat bagi masyarakat luas!"</p>
                  <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full border border-gray-300 dark:border-white/20 flex items-center justify-center text-gray-900 dark:text-white text-xl">👋</div><p className="text-sm text-gray-500 dark:text-zinc-500 font-medium">Salam Hangat</p></div>
              </div>
          </div>
      </motion.section>

      {/* VISI MISI */}
      <motion.section className="py-32 px-4 relative overflow-hidden" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
         <div className="container mx-auto max-w-6xl">
            <motion.div variants={fadeInUp} className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4">Visi & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">Misi</span></h2>
                <p className="text-gray-500 dark:text-zinc-400 max-w-2xl mx-auto">Fondasi dan arah gerak kami dalam membangun masa depan teknologi.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-12 items-stretch">
                <motion.div variants={fadeInUp} animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="h-full">
                    <TiltCard className="h-full relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-10 text-[12rem] font-black text-purple-100 dark:text-purple-900/10 select-none pointer-events-none transition-transform group-hover:scale-110 duration-700">01</div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8 text-3xl shadow-lg shadow-purple-500/20">👁️</div>
                            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-purple-400 mb-6">Visi Kami</h3>
                            <p className="text-gray-600 dark:text-zinc-300 text-lg leading-relaxed font-light">{profil.visi || "Menjadi pusat keunggulan teknologi dan pengembangan karakter mahasiswa TI."}</p>
                        </div>
                    </TiltCard>
                </motion.div>
                <motion.div variants={fadeInUp} animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }} className="h-full">
                    <TiltCard className="h-full relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-10 text-[12rem] font-black text-cyan-100 dark:text-cyan-900/10 select-none pointer-events-none transition-transform group-hover:scale-110 duration-700">02</div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-8 text-3xl shadow-lg shadow-cyan-500/20">🚀</div>
                            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-cyan-400 mb-6">Misi Kami</h3>
                            <p className="text-gray-600 dark:text-zinc-300 text-lg leading-relaxed font-light">{profil.misi || "Menyelenggarakan kegiatan edukatif, inovatif, dan kolaboratif."}</p>
                        </div>
                    </TiltCard>
                </motion.div>
            </div>
         </div>
      </motion.section>

      {/* EVENT SECTION */}
      <motion.section id="event" className="py-32 px-4 container mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
        <motion.div variants={fadeInUp} className="flex justify-between items-end mb-16">
            <div><h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">Agenda Terbaru</h2><p className="text-gray-500 dark:text-zinc-500">Eksplorasi kegiatan yang akan datang.</p></div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((ev, i) => (
                <motion.div key={i} variants={fadeInUp}>
                    <TiltCard onClick={() => navigate(`/event/${ev.id}`)} noPadding className="cursor-pointer h-full">
                        <div className="h-full flex flex-col bg-white dark:bg-[#0a0a0a]">
                            <div className="relative h-64 overflow-hidden border-b border-gray-200 dark:border-white/5 rounded-t-3xl">
                                <img src={ev.poster_url} className="w-full h-full object-cover transform group-hover/tilt:scale-110 transition duration-700" alt={ev.judul}/>
                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/70 backdrop-blur border border-white/10 px-3 py-1 rounded-lg text-xs font-bold text-black dark:text-white uppercase tracking-wider z-10 shadow-sm">{ev.kategori || "EVENT"}</div>
                            </div>
                            <div className="p-8 flex-grow flex flex-col">
                                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest mb-3"><Icons.Calendar /> {ev.tanggal}</div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover/tilt:text-purple-600 dark:group-hover/tilt:text-purple-400 transition">{ev.judul}</h3>
                                <p className="text-gray-600 dark:text-zinc-500 text-sm line-clamp-3 mb-6">{ev.deskripsi}</p>
                                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/5 flex justify-between items-center"><span className="text-gray-500 dark:text-zinc-400 text-xs font-bold">Lihat Detail</span><div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center transform -rotate-45 group-hover/tilt:rotate-0 transition duration-300">→</div></div>
                            </div>
                        </div>
                    </TiltCard>
                </motion.div>
            ))}
        </div>
      </motion.section>

      {/* === GALLERY SECTION (SLIDESHOW BACKGROUND - BLUR TETAP KUAT 20px) === */}
      <motion.section 
        id="gallery" 
        className="py-32 px-4 relative overflow-hidden isolate" 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
          <div className="absolute inset-0 z-0">
             <AnimatePresence mode='wait'>
                 <motion.img 
                    key={bgIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }} 
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }} 
                    
                    src={gallery.length > 0 ? gallery[bgIndex].foto_url : "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1920&q=80"}
                    // DI SINI BLUR TETAP 20px SESUAI PERMINTAAN
                    className="absolute inset-0 w-full h-full object-cover blur-[20px] scale-110 saturate-150"
                    alt="Background Blur"
                 />
             </AnimatePresence>
             
             <div className="absolute inset-0 bg-gradient-to-b from-gray-50/90 via-white/40 to-gray-50/90 dark:from-[#050505] dark:via-black/40 dark:to-[#050505] z-10"></div>
          </div>

          <div className="container mx-auto relative z-20">
              <motion.h2 variants={fadeInUp} className="text-4xl font-black text-center text-gray-900 dark:text-white mb-16 drop-shadow-2xl">
                  Momen Berharga
              </motion.h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                  {gallery.map((gal, i) => (
                      <motion.div key={i} variants={fadeInUp} className={`${i%3===0 ? 'md:col-span-2' : ''}`}>
                          <TiltCard noPadding className="h-64 md:h-80 shadow-2xl border border-white/20 dark:border-white/10">
                              <img src={gal.foto_url} className="w-full h-full object-cover grayscale group-hover/tilt:grayscale-0 transition duration-500" alt="Galeri"/>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover/tilt:opacity-100 transition duration-500 flex items-end p-6 z-10">
                                  <p className="text-white font-bold tracking-tight drop-shadow-md">{gal.judul}</p>
                              </div>
                          </TiltCard>
                      </motion.div>
                  ))}
              </div>
          </div>
      </motion.section>

      {/* FAQ SECTION */}
      <motion.section className="py-24 px-4 container mx-auto max-w-3xl" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
          <motion.h2 variants={fadeInUp} className="text-3xl font-black text-center text-gray-900 dark:text-white mb-12">Pertanyaan Umum</motion.h2>
          <div className="space-y-4">
              {faqs.map((item, i) => (
                  <motion.div key={i} variants={fadeInUp} className="rounded-2xl p-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 overflow-hidden transition-all hover:border-purple-500/30 shadow-sm">
                      <details className="group p-6 cursor-pointer">
                          <summary className="font-bold text-gray-800 dark:text-zinc-200 flex justify-between items-center list-none outline-none">{item.q}<span className="text-purple-500 transform group-open:rotate-180 transition duration-300">▼</span></summary>
                          <p className="text-gray-600 dark:text-zinc-400 mt-4 leading-relaxed pl-4 border-l-2 border-purple-500 text-sm">{item.a}</p>
                      </details>
                  </motion.div>
              ))}
          </div>
      </motion.section>

      {/* ASPIRASI FORM */}
      <motion.section id="aspirasi" className="py-32 px-4 relative" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <div className="container mx-auto max-w-3xl">
            <TiltCard className="rounded-[2.5rem] bg-white/80 dark:bg-black/80 backdrop-blur-xl p-2">
                <div className="rounded-[2rem] border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-zinc-900/50 p-10 md:p-16 text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">Suara Mahasiswa</h2>
                    <p className="text-gray-600 dark:text-zinc-400 mb-10 text-lg">Punya ide liar atau kritik pedas? Kirimkan secara anonim.</p>
                    
                    <form onSubmit={handleKirimWA} className="space-y-4 text-left max-w-md mx-auto">
                        <input type="text" placeholder="Nama Kamu (Boleh Samaran)" className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl px-5 py-4 focus:outline-none focus:border-purple-500 focus:bg-purple-50 dark:focus:bg-purple-900/10 transition" value={formWA.nama} onChange={e => setFormWA({...formWA, nama: e.target.value})} required />
                        <input type="text" placeholder="No. WhatsApp / Telepon" className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl px-5 py-4 focus:outline-none focus:border-purple-500 focus:bg-purple-50 dark:focus:bg-purple-900/10 transition" value={formWA.telepon} onChange={e => setFormWA({...formWA, telepon: e.target.value})} />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <select 
                                className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 rounded-xl px-5 py-4 focus:outline-none focus:border-purple-500 appearance-none" 
                                value={formWA.angkatan} 
                                onChange={e => setFormWA({...formWA, angkatan: e.target.value})}
                            >
                                <option value="">Angkatan</option>
                                <option value="2024">2024</option>
                                <option value="2023">2023</option>
                                <option value="2022">2022</option>
                                <option value="2021">2021</option>
                            </select>

                            <select 
                                className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 rounded-xl px-5 py-4 focus:outline-none focus:border-purple-500 appearance-none" 
                                value={formWA.jenis} 
                                onChange={e => setFormWA({...formWA, jenis: e.target.value})}
                            >
                                <option value="Kritik">Kritik</option>
                                <option value="Saran">Saran</option>
                            </select>
                        </div>

                        <textarea rows="4" placeholder="Tulis pesanmu di sini..." className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl px-5 py-4 focus:outline-none focus:border-purple-500 transition" value={formWA.pesan} onChange={e => setFormWA({...formWA, pesan: e.target.value})} required></textarea>
                        <button className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl hover:opacity-80 transition shadow-lg flex items-center justify-center gap-2">Kirim Pesan</button>
                    </form>
                </div>
            </TiltCard>
        </div>
      </motion.section>
    </>
  );
}