import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

// --- DATA STATIS (DUMMY) ---
// Ini menggantikan data dari Database agar website bisa jalan di Vercel tanpa API
const DUMMY_PROFIL = {
  nama_himpunan: "HIMA UNIS",
  logo_url: "https://upload.wikimedia.org/wikipedia/id/0/03/Logo_UNIS_Tangerang.png",
  visi: "Menjadi pusat keunggulan teknologi dan pengembangan karakter mahasiswa Teknik Informatika yang inovatif dan berdaya saing global.",
  misi: "Menyelenggarakan kegiatan edukatif di bidang IT, membangun relasi profesional dengan industri, serta mewadahi kreativitas mahasiswa melalui proyek nyata."
};

const DUMMY_EVENTS = [
  {
    id: 1,
    judul: "Webinar Tech Stack 2026",
    tanggal: "25 Januari 2026",
    kategori: "WEBINAR",
    poster_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    deskripsi: "Membahas tren teknologi terbaru yang akan mendominasi industri perangkat lunak di tahun 2026."
  },
  {
    id: 2,
    judul: "Hackathon UNIS 1.0",
    tanggal: "12 Februari 2026",
    kategori: "COMPETITION",
    poster_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    deskripsi: "Ajang kolaborasi 24 jam untuk menciptakan solusi digital bagi permasalahan UMKM di Tangerang."
  },
  {
    id: 3,
    judul: "Workshop UI/UX Design",
    tanggal: "05 Maret 2026",
    kategori: "WORKSHOP",
    poster_url: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&w=800&q=80",
    deskripsi: "Belajar prinsip desain modern dan implementasi ke sistem desain yang skalabel menggunakan Figma."
  }
];

const DUMMY_GALLERY = [
  { foto_url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80", judul: "Musyawarah Besar" },
  { foto_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80", judul: "Workshop Web" },
  { foto_url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80", judul: "Pengabdian Masyarakat" },
  { foto_url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80", judul: "Seminar Nasional" }
];

// --- UTILS & VARIANTS ---
const fadeInUp = { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } } };

function TiltCard({ children, className = "", onClick, noPadding = false }) {
  const x = useMotionValue(0); const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 }); const mouseY = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["12deg", "-12deg"]); const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-12deg", "12deg"]);
  const glowX = useTransform(mouseX, [-0.5, 0.5], ["-25%", "25%"]); const glowY = useTransform(mouseY, [-0.5, 0.5], ["-25%", "25%"]);
  const brightness = useTransform(mouseY, [-0.5, 0.5], [1, 1.05]);
  function handleMouseMove(e) { const rect = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - rect.left) / rect.width - 0.5); y.set((e.clientY - rect.top) / rect.height - 0.5); }
  function handleMouseLeave() { x.set(0); y.set(0); }
  return (
    <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={`relative group/tilt z-0 perspective-1000 ${className}`}>
      <motion.div style={{ x: glowX, y: glowY, transform: "translateZ(-50px)" }} className="absolute -inset-8 bg-gradient-to-r from-purple-600/30 via-cyan-500/30 to-purple-600/30 rounded-[3rem] blur-3xl opacity-0 group-hover/tilt:opacity-70 transition-opacity duration-500 -z-20" />
      <motion.div style={{ filter: `brightness(${brightness})` }} className={`relative h-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 overflow-hidden rounded-3xl transition-colors duration-300 shadow-xl dark:shadow-none ${noPadding ? '' : 'p-8'}`}>
         <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent dark:from-white/10 dark:to-transparent opacity-0 group-hover/tilt:opacity-100 transition duration-500 pointer-events-none z-10"></div>
         {children}
      </motion.div>
    </motion.div>
  );
}

const Icons = {
  ArrowRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>,
  Bolt: () => <svg className="w-6 h-6 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Users: () => <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  Calendar: () => <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
};

export default function Home() {
  const navigate = useNavigate();
  const [bgIndex, setBgIndex] = useState(0);
  const [formWA, setFormWA] = useState({ nama: "", telepon: "", angkatan: "2024", jenis: "Kritik", pesan: "" });

  // Menggunakan data statis langsung
  const profil = DUMMY_PROFIL;
  const events = DUMMY_EVENTS;
  const gallery = DUMMY_GALLERY;

  useEffect(() => {
    const interval = setInterval(() => {
        setBgIndex((prevIndex) => (prevIndex + 1) % gallery.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [gallery.length]);

  const handleKirimWA = (e) => { 
      e.preventDefault(); 
      const text = `Halo Admin, Saya ingin menyampaikan aspirasi:%0A%0A👤 *Nama:* ${formWA.nama}%0A📞 *No. HP:* ${formWA.telepon || '-' }%0A🎓 *Angkatan:* ${formWA.angkatan}%0A🏷️ *Jenis:* ${formWA.jenis}%0A%0A📝 *Pesan:*%0A${formWA.pesan}`; 
      window.open(`https://wa.me/6281234567890?text=${text}`, '_blank'); 
  };

  const divisiList = [ { name: "BPH Inti", slug: "bph" }, { name: "Riset & Teknologi", slug: "iptek" }, { name: "Media Kreatif", slug: "kominfo" }, { name: "Pengembangan SDM", slug: "psdm" }, { name: "Hubungan Publik", slug: "humas" }, { name: "Dana Usaha", slug: "danus" } ];
  const stats = [ { label: "Anggota Aktif", value: "150+", icon: <Icons.Users /> }, { label: "Event Terlaksana", value: "45+", icon: <Icons.Calendar /> }, { label: "Tahun Berdiri", value: "2008", icon: <Icons.Bolt /> } ];
  const faqs = [ { q: "Kapan Open Recruitment dibuka?", a: "Biasanya kami membuka pendaftaran anggota baru setiap awal semester ganjil (September)." }, { q: "Apakah mengganggu kuliah?", a: "Tidak! Justru di sini kamu belajar manajemen waktu antara akademik dan organisasi." }, { q: "Apa benefit jadi pengurus?", a: "Soft-skill leadership, networking, dan akses prioritas ke event teknologi." }, { q: "Mahasiswa baru boleh ikut?", a: "Sangat boleh! Justru ini saat yang tepat untuk membangun relasi sejak dini." } ];

  return (
    <>
      {/* HERO SECTION - Responsif di HP */}
      <section className="relative min-h-[100dvh] flex flex-col justify-center items-center text-center px-4 pb-20 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <AnimatePresence mode='wait'>
                 <motion.img 
                    key={bgIndex}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} 
                    src={gallery[bgIndex].foto_url}
                    className="absolute inset-0 w-full h-full object-cover blur-[6px] scale-105 saturate-125" alt="Bg"
                 />
             </AnimatePresence>
            <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-[2px] z-10"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 dark:from-[#050505] to-transparent z-10"></div>
        </div>

        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="relative z-20 max-w-4xl mx-auto pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/50 bg-black/40 text-purple-200 text-[10px] font-bold tracking-widest uppercase mb-6 shadow-lg backdrop-blur-md">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span></span> Official Website 2026
          </div>
          <img src={profil.logo_url} className="w-20 md:w-24 h-20 md:h-24 object-contain mx-auto mb-6 drop-shadow-2xl animate-pulse-slow" alt="Logo" />
          <h1 className="text-4xl md:text-8xl lg:text-9xl font-black mb-4 md:mb-6 tracking-tighter text-white leading-none drop-shadow-2xl uppercase">WE ARE <br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500">CREATORS.</span></h1>
          <p className="text-sm md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed font-light drop-shadow-md">Bergabunglah dalam ekosistem <span className="font-bold text-white">{profil.nama_himpunan}</span>. Tempat di mana baris kode bertemu dengan inovasi nyata.</p>
          <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4 w-full md:w-auto">
              <Link to="/tentang-kami" className="group relative px-6 py-3 md:px-8 md:py-4 bg-white text-black rounded-full font-bold overflow-hidden transition-all hover:scale-105 shadow-xl w-full md:w-auto">
                  <span className="relative z-10 flex items-center justify-center gap-2">Jelajahi Kami <Icons.ArrowRight /></span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-cyan-200 opacity-0 group-hover:opacity-100 transition duration-300"></div>
              </Link>
              <a href="#event" className="px-6 py-3 md:px-8 md:py-4 rounded-full font-bold border border-white/30 bg-black/20 backdrop-blur-md hover:bg-white/10 transition text-white w-full md:w-auto">Lihat Kegiatan</a>
          </div>
        </motion.div>

        <div className="absolute bottom-0 w-full overflow-hidden border-t border-white/10 bg-black/40 backdrop-blur-md py-4 z-20">
            <motion.div animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }} className="flex gap-12 whitespace-nowrap opacity-80">
                {[...divisiList, ...divisiList].map((d, i) => (<span key={i} className="text-[10px] md:text-sm font-mono uppercase tracking-widest text-gray-300 flex items-center gap-4"><span className="w-2 h-2 bg-purple-500 rounded-full"></span> {d.name}</span>))}
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

      {/* VISI MISI */}
      <motion.section className="py-32 px-4 relative overflow-hidden" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
         <div className="container mx-auto max-w-6xl">
            <motion.div variants={fadeInUp} className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4">Visi & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">Misi</span></h2>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-12 items-stretch">
                <motion.div variants={fadeInUp} className="h-full">
                    <TiltCard className="h-full relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-4xl font-black text-purple-600 mb-6 uppercase">Visi</h3>
                            <p className="text-gray-600 dark:text-zinc-300 text-lg leading-relaxed font-light">{profil.visi}</p>
                        </div>
                    </TiltCard>
                </motion.div>
                <motion.div variants={fadeInUp} className="h-full">
                    <TiltCard className="h-full relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-4xl font-black text-cyan-600 mb-6 uppercase">Misi</h3>
                            <p className="text-gray-600 dark:text-zinc-300 text-lg leading-relaxed font-light">{profil.misi}</p>
                        </div>
                    </TiltCard>
                </motion.div>
            </div>
         </div>
      </motion.section>

      {/* EVENT SECTION */}
      <motion.section id="event" className="py-32 px-4 container mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
        <div className="flex justify-between items-end mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">Agenda</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((ev, i) => (
                <motion.div key={i} variants={fadeInUp}>
                    <TiltCard noPadding className="h-full">
                        <div className="relative h-64 overflow-hidden rounded-t-3xl">
                            <img src={ev.poster_url} className="w-full h-full object-cover" alt={ev.judul}/>
                            <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-lg text-xs font-bold text-black uppercase tracking-wider">{ev.kategori}</div>
                        </div>
                        <div className="p-8">
                            <p className="text-purple-600 text-xs font-bold mb-3 uppercase">{ev.tanggal}</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{ev.judul}</h3>
                            <p className="text-gray-600 dark:text-zinc-500 text-sm line-clamp-3">{ev.deskripsi}</p>
                        </div>
                    </TiltCard>
                </motion.div>
            ))}
        </div>
      </motion.section>

      {/* GALLERY SECTION - Tetap Blur 20px */}
      <motion.section id="gallery" className="py-32 px-4 relative overflow-hidden isolate" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
          <div className="absolute inset-0 z-0">
             <AnimatePresence mode='wait'>
                 <motion.img key={bgIndex} initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} 
                    src={gallery[bgIndex].foto_url} className="absolute inset-0 w-full h-full object-cover blur-[20px] scale-110 saturate-150" alt="Bg"
                 />
             </AnimatePresence>
             <div className="absolute inset-0 bg-gradient-to-b from-gray-50/90 via-white/40 to-gray-50/90 dark:from-[#050505] dark:via-black/40 dark:to-[#050505] z-10"></div>
          </div>
          <div className="container mx-auto relative z-20">
              <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-16">Momen Berharga</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                  {gallery.map((gal, i) => (
                      <motion.div key={i} variants={fadeInUp} className={`${i%3===0 ? 'md:col-span-2' : ''}`}>
                          <TiltCard noPadding className="h-64 md:h-80 shadow-2xl">
                              <img src={gal.foto_url} className="w-full h-full object-cover grayscale group-hover/tilt:grayscale-0 transition duration-500" alt="Galeri"/>
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/tilt:opacity-100 transition flex items-end p-6 z-10"><p className="text-white font-bold">{gal.judul}</p></div>
                          </TiltCard>
                      </motion.div>
                  ))}
              </div>
          </div>
      </motion.section>

      {/* ASPIRASI FORM */}
      <motion.section id="aspirasi" className="py-32 px-4 relative" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <div className="container mx-auto max-w-3xl">
            <TiltCard className="rounded-[2.5rem] bg-white/80 dark:bg-black/80 backdrop-blur-xl p-6 md:p-16 text-center">
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 uppercase">Suara Mahasiswa</h2>
                <form onSubmit={handleKirimWA} className="space-y-4 text-left max-w-md mx-auto">
                    <input type="text" placeholder="Nama" className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl px-5 py-4 focus:outline-none" value={formWA.nama} onChange={e => setFormWA({...formWA, nama: e.target.value})} required />
                    <textarea rows="4" placeholder="Pesan..." className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl px-5 py-4 focus:outline-none" value={formWA.pesan} onChange={e => setFormWA({...formWA, pesan: e.target.value})} required></textarea>
                    <button className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl hover:opacity-80 transition shadow-lg">Kirim via WhatsApp</button>
                </form>
            </TiltCard>
        </div>
      </motion.section>
    </>
  );
}