import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';

// --- UTILS: TILT CARD ---
function TiltCard({ children, className = "" }) {
  const x = useMotionValue(0); const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 }); const mouseY = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]); const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);
  const brightness = useTransform(mouseY, [-0.5, 0.5], [1, 1.05]);
  return (
    <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} onMouseMove={e=>{const rect=e.currentTarget.getBoundingClientRect();x.set((e.clientX-rect.left)/rect.width-0.5);y.set((e.clientY-rect.top)/rect.height-0.5)}} onMouseLeave={()=>{x.set(0);y.set(0)}} className={`relative group/tilt z-0 perspective-1000 ${className}`}>
      <motion.div style={{ filter: `brightness(${brightness})` }} className="relative h-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 overflow-hidden rounded-3xl transition-colors duration-300 shadow-xl dark:shadow-none p-8">
         <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent dark:from-white/10 dark:to-transparent opacity-0 group-hover/tilt:opacity-100 transition duration-500 pointer-events-none z-10"></div>
         {children}
      </motion.div>
    </motion.div>
  );
}

export default function TentangKami() {
  const BASE_URL = "http://localhost/himpunan-api/api.php";
  const [profil, setProfil] = useState({ nama_himpunan: "Loading...", logo_url: "", visi: "", misi: "" });

  useEffect(() => {
    const fetchProfil = async () => {
      try { const res = await axios.get(`${BASE_URL}?action=get_profil`); setProfil(res.data || {}); } catch (e) {}
    };
    fetchProfil();
  }, []);

  const maknaLogo = [
    { title: "Biru Elektrik", desc: "Melambangkan teknologi masa depan dan kecerdasan digital." },
    { title: "Globe", desc: "Konektivitas tanpa batas dan wawasan global mahasiswa." },
    { title: "Buku", desc: "Fondasi akademis yang kuat sebagai dasar inovasi." },
    { title: "Roda Gigi", desc: "Sinergi dan kerja keras yang terus berputar dinamis." }
  ];

  return (
    <div className="pb-20 pt-10 px-4">
        <div className="text-center mb-20 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] -z-10"></div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-gray-900 dark:text-white">Tentang <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">Kami</span></h1>
            <p className="text-xl text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">Menggali lebih dalam esensi, tujuan, dan semangat yang menggerakkan {profil.nama_himpunan}.</p>
        </div>

        <div className="container mx-auto max-w-5xl mb-24">
            <TiltCard className="flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/3 flex justify-center">{profil.logo_url && <img src={profil.logo_url} className="w-48 h-48 object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.3)] animate-pulse-slow" alt="Logo" />}</div>
                <div className="md:w-2/3">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Siapa Kami?</h2>
                    <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-lg mb-4"><strong className="text-purple-600 dark:text-purple-400">{profil.nama_himpunan}</strong> adalah rumah bagi para inovator muda. Organisasi ini berdiri sebagai wadah kolaborasi mahasiswa Teknik Informatika.</p>
                </div>
            </TiltCard>
        </div>

        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-8 mb-24">
            <TiltCard>
                <h3 className="text-3xl font-black mb-6 text-purple-600 dark:text-purple-400 flex items-center gap-3"><span>👁️</span> Visi</h3>
                <p className="text-gray-600 dark:text-zinc-300 text-lg leading-relaxed whitespace-pre-line">{profil.visi || "Loading..."}</p>
            </TiltCard>
            <TiltCard>
                <h3 className="text-3xl font-black mb-6 text-cyan-600 dark:text-cyan-400 flex items-center gap-3"><span>🚀</span> Misi</h3>
                <p className="text-gray-600 dark:text-zinc-300 text-lg leading-relaxed whitespace-pre-line">{profil.misi || "Loading..."}</p>
            </TiltCard>
        </div>

        <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">Makna Simbolis</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {maknaLogo.map((item, i) => (
                    <TiltCard key={i} className="text-center">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                        <p className="text-gray-500 dark:text-zinc-500 text-sm">{item.desc}</p>
                    </TiltCard>
                ))}
            </div>
        </div>
    </div>
  );
}