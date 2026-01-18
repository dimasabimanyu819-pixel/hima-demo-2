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
  
  // DATA DUMMY AWAL (Agar tidak kosong saat loading API)
  const [profil, setProfil] = useState({ 
    nama_himpunan: "HIMA TI UNIS", 
    logo_url: "https://upload.wikimedia.org/wikipedia/id/c/c3/Logo_UNIS_Tangerang.png", 
    visi: "Menjadi wadah kolaborasi teknologi yang inovatif dan berdaya saing global bagi mahasiswa Teknik Informatika.", 
    misi: "Membangun ekosistem riset yang berkelanjutan, menyelenggarakan pelatihan kompetensi digital, dan mempererat solidaritas antar mahasiswa." 
  });

  const [events, setEvents] = useState([
    { id: 1, judul: "UNIS Tech Fest 2026", tanggal: "12 Mei 2026", kategori: "WEBINAR", poster_url: "https://images.unsplash.com/photo-1540575861501-7ad05823c28b?auto=format&fit=crop&w=800", deskripsi: "Mengenal masa depan Web3 dan integrasi AI dalam pengembangan aplikasi modern bersama pakar industri." },
    { id: 2, judul: "Coding Competition", tanggal: "20 Juni 2026", kategori: "LOMBA", poster_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800", deskripsi: "Uji kemampuan logikamu dalam tantangan algoritma tingkat nasional di Universitas Islam Syekh-Yusuf." },
    { id: 3, judul: "Internal Workshop", tanggal: "05 Juli 2026", kategori: "PELATIHAN", poster_url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800", deskripsi: "Pelatihan khusus anggota Himpunan mengenai dasar-dasar UI/UX menggunakan Figma dan Framer." }
  ]);

  const [gallery, setGallery] = useState([
    { foto_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200", judul: "Diskusi Forum Mahasiswa" },
    { foto_url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200", judul: "Seminar Nasional TI" },
    { foto_url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200", judul: "Dies Natalis Himpunan" },
    { foto_url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200", judul: "Pelatihan Bersama" }
  ]);
  
  const [bgIndex, setBgIndex] = useState(0);
  const [formWA, setFormWA] = useState({ nama: "", telepon: "", angkatan: "2024", jenis: "Kritik", pesan: "" });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const p = await axios.get(`${BASE_URL}?action=get_profil`); 
        if (p.data) setProfil(p.data);
        
        const e = await axios.get(`${BASE_URL}?action=get_events`); 
        if (Array.isArray(e.data) && e.data.length > 0) setEvents(e.data);
        
        const g = await axios.get(`${BASE_URL}?action=get_gallery`); 
        if (Array.isArray(g.data) && g.data.length > 0) setGallery(g.data);
      } catch (err) {}
    };
    fetchAll();
  }, []);

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

          <h1 className="text-6xl md:text-9xl font-black mb-6 tracking-tighter text-white leading-[0.9] drop-shadow-2xl uppercase">KABINET <br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500">SAMUHITA</span></h1>
          
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

      <motion.section className="py-24 px-4 bg-gray-100/50 dark:bg-zinc-900/20 border-y border-gray-200 dark:border-white/5" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp}>
          <div className="container mx-auto flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 w-full flex justify-center">
                  <TiltCard noPadding className="w-full max-w-md aspect-[4/5]">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover grayscale group-hover/tilt:grayscale-0 transition duration-500" alt="Ketua Himpunan"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 text-left z-10"><p className="text-white text-xl font-bold">Fauzan Syam</p><p className="text-zinc-300 text-sm">Ketua Umum 2025/2026</p></div>
                  </TiltCard>
              </div>
              <div className="md:w-1/2 w-full text-left">
                  <h4 className="text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest mb-3 text-sm">Kata Sambutan</h4>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">Grow Together, <br/>Code Forever.</h2>
                  <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-lg mb-8">"Di HIMA TI UNIS, kami bukan sekadar organisasi. Kami adalah ekosistem bagi mahasiswa untuk mengeksplorasi potensi digital seluas-luasnya melalui kolaborasi Samuhita yang inklusif."</p>
                  <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full border border-gray-300 dark:border-white/20 flex items-center justify-center text-gray-900 dark:text-white text-xl">👋</div><p className="text-sm text-gray-500 dark:text-zinc-500 font-medium">Salam Samuhita!</p></div>
              </div>
          </div>
      </motion.section>

      <motion.section className="py-32 px-4 relative overflow-hidden" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
         <div className="container mx-auto max-w-6xl">
            <motion.div variants={fadeInUp} className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4">Visi & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">Misi</span></h2>
                <p className="text-gray-500 dark:text-zinc-400 max-w-2xl mx-auto">Arah gerak Kabinet Samuhita dalam membangun masa depan teknologi di UNIS.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-12 items-stretch">
                <motion.div variants={fadeInUp} animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="h-full">
                    <TiltCard className="h-full relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-10 text-[12rem] font-black text-purple-100 dark:text-purple-900/10 select-none pointer-events-none transition-transform group-hover:scale-110 duration-700">01</div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8 text-3xl shadow-lg shadow-purple-500/20">👁️</div>
                            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-purple-400 mb-6">Visi Kami</h3>
                            <p className="text-gray-600 dark:text-zinc-300 text-lg leading-relaxed font-light">{profil.visi}</p>
                        </div>
                    </TiltCard>
                </motion.div>
                <motion.div variants={fadeInUp} animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }} className="h-full">
                    <TiltCard className="h-full relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-10 text-[12rem] font-black text-cyan-100 dark:text-cyan-900/10 select-none pointer-events-none transition-transform group-hover:scale-110 duration-700">02</div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-8 text-3xl shadow-lg shadow-cyan-500/20">🚀</div>
                            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-600 to-cyan-400 mb-6">Misi Kami</h3>
                            <p className="text-gray-600 dark:text-zinc-300 text-lg leading-relaxed font-light">{profil.misi}</p>
                        </div>
                    </TiltCard>
                </motion.div>
            </div>
         </div>
      </motion.section>

      <motion.section id="event" className="py-32 px-4 container mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
        <motion.div variants={fadeInUp} className="flex justify-between items-end mb-16">
            <div><h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">Agenda Terbaru</h2><p className="text-gray-500 dark:text-zinc-500">Eksplorasi kegiatan teknologi mendatang.</p></div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((ev, i) => (
                <motion.div key={i} variants={fadeInUp}>
                    <TiltCard onClick={() => navigate(`/event/${ev.id}`)} noPadding className="cursor-pointer h-full">
                        <div className="h-full flex flex-col bg-white dark:bg-[#0a0a0a]">
                            <div className="relative h-64 overflow-hidden border-b border-gray-200 dark:border-white/5 rounded-t-3xl">
                                <img src={ev.poster_url} className="w-full h-full object-cover transform group-hover/tilt:scale-110 transition duration-700" alt={ev.judul}/>
                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/70 backdrop-blur border border-white/10 px-3 py-1 rounded-lg text-xs font-bold text-black dark:text-white uppercase tracking-wider z-10 shadow-sm">{ev.kategori}</div>
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

      <motion.section id="gallery" className="py-32 px-4 relative overflow-hidden isolate" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
          <div className="absolute inset-0 z-0">
             <AnimatePresence mode='wait'>
                 <motion.img 
                    key={bgIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }} 
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }} 
                    src={gallery.length > 0 ? gallery[bgIndex].foto_url : ""}
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
                            <select className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 rounded-xl px-5 py-4 focus:outline-none focus:border-purple-500 appearance-none" value={formWA.angkatan} onChange={e => setFormWA({...formWA, angkatan: e.target.value})}>
                                <option value="">Angkatan</option>
                                <option value="2024">2024</option><option value="2023">2023</option><option value="2022">2022</option><option value="2021">2021</option>
                            </select>
                            <select className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 rounded-xl px-5 py-4 focus:outline-none focus:border-purple-500 appearance-none" value={formWA.jenis} onChange={e => setFormWA({...formWA, jenis: e.target.value})}>
                                <option value="Kritik">Kritik</option><option value="Saran">Saran</option>
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