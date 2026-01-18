import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';

// --- UTILS: TILT CARD (Agar desain konsisten) ---
function TiltCard({ children, className = "", noPadding = false }) {
  const x = useMotionValue(0); const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 }); const mouseY = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]); const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);
  const glowX = useTransform(mouseX, [-0.5, 0.5], ["-25%", "25%"]); const glowY = useTransform(mouseY, [-0.5, 0.5], ["-25%", "25%"]);
  const brightness = useTransform(mouseY, [-0.5, 0.5], [1, 1.05]);

  return (
    <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} onMouseMove={e=>{const rect=e.currentTarget.getBoundingClientRect();x.set((e.clientX-rect.left)/rect.width-0.5);y.set((e.clientY-rect.top)/rect.height-0.5)}} onMouseLeave={()=>{x.set(0);y.set(0)}} className={`relative group/tilt z-0 perspective-1000 ${className}`}>
      <motion.div style={{ x: glowX, y: glowY, transform: "translateZ(-50px)" }} className="absolute -inset-8 bg-gradient-to-r from-purple-600/30 via-cyan-500/30 to-purple-600/30 rounded-[3rem] blur-3xl opacity-0 group-hover/tilt:opacity-70 transition-opacity duration-500 -z-20"/>
      <motion.div style={{ filter: `brightness(${brightness})` }} className={`relative h-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 overflow-hidden rounded-3xl transition-colors duration-300 shadow-xl dark:shadow-none ${noPadding ? '' : 'p-8'}`}>
         <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent dark:from-white/10 dark:to-transparent opacity-0 group-hover/tilt:opacity-100 transition duration-500 pointer-events-none z-10"></div>
         {children}
      </motion.div>
    </motion.div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`http://localhost/himpunan-api/api.php?action=get_event_detail&id=${id}`);
        setEvent(res.data);
      } catch (err) {} finally { setLoading(false); }
    };
    fetchEvent();
  }, [id]);

  if (loading) return <div className="min-h-screen flex justify-center items-center text-zinc-500">Memuat Data...</div>;
  if (!event) return <div className="min-h-screen flex justify-center items-center text-zinc-500">Event Tidak Ditemukan</div>;

  const categories = event.kategori ? event.kategori.split(',') : ['Umum'];
  const benefitList = event.benefits ? event.benefits.split(',') : [];

  return (
    <div className="min-h-screen pb-20">
      {/* HERO */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent dark:from-[#050505] dark:via-[#050505]/50 z-10"></div>
        <img src={event.poster_url} className="w-full h-full object-cover blur-sm opacity-50 scale-110" alt="Background" />
        <div className="absolute bottom-0 left-0 w-full z-20 container mx-auto px-4 pb-12">
            <button onClick={() => navigate('/')} className="mb-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-sm hover:bg-white/20 transition">← Kembali</button>
            <div className="flex gap-2 mb-4">
                {categories.map((c,i)=>(<span key={i} className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">{c}</span>))}
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-gray-900 dark:text-white mb-2 shadow-black drop-shadow-lg">{event.judul}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-30 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* KONTEN KIRI */}
        <div className="lg:col-span-2 space-y-8">
            <TiltCard>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-white/10 pb-4">Deskripsi Acara</h2>
                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-zinc-400 whitespace-pre-line leading-relaxed">
                    {event.deskripsi}
                </div>
            </TiltCard>

            <div className="grid md:grid-cols-2 gap-6">
                <TiltCard>
                    <h3 className="text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider text-xs mb-2">Pemateri</h3>
                    <p className="text-gray-900 dark:text-white text-xl font-bold">{event.pemateri || "TBA"}</p>
                </TiltCard>
                
                {/* BENEFIT SECTION (NEW) */}
                <TiltCard>
                    <h3 className="text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider text-xs mb-3">Benefit Peserta</h3>
                    {benefitList.length > 0 ? (
                        <ul className="space-y-2">
                            {benefitList.map((b, i) => (
                                <li key={i} className="flex items-center gap-2 text-gray-600 dark:text-zinc-300 text-sm">
                                    <span className="text-green-500">✓</span> {b.trim()}
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-gray-500 text-sm">-</p>}
                </TiltCard>
            </div>
        </div>

        {/* SIDEBAR KANAN */}
        <div className="space-y-6">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-8 rounded-3xl sticky top-24 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Detail Pelaksanaan</h3>
                <div className="space-y-6">
                    {[
                        { icon: "📅", label: "Tanggal", val: event.tanggal },
                        { icon: "⏰", label: "Waktu", val: `${event.waktu_mulai} - ${event.waktu_selesai}` },
                        { icon: "📍", label: "Lokasi", val: event.lokasi },
                        { icon: "👥", label: "Kapasitas", val: `${event.kapasitas} Kursi` },
                        { icon: "📞", label: "Contact Person", val: event.contact_person || "-" }, // CP DITAMBAHKAN
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-black rounded-full flex items-center justify-center text-lg">{item.icon}</div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-zinc-500 uppercase font-bold">{item.label}</p>
                                <p className="text-gray-900 dark:text-white font-medium text-sm">{item.val}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-purple-600/30">
                        Daftar Sekarang
                    </button>
                    {event.batas_pendaftaran && <p className="text-center text-xs text-red-500 mt-4 font-bold">Batas: {event.batas_pendaftaran}</p>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}