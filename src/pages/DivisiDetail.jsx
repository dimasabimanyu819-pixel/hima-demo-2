import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

// --- KOMPONEN: MEMBER CARD (DENGAN ONCLICK) ---
function MemberCard({ member, onClick }) {
  const x = useMotionValue(0); const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 }); const mouseY = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["8deg", "-8deg"]); const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-8deg", "8deg"]);

  return (
    <motion.div 
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} 
        onMouseMove={e=>{const rect=e.currentTarget.getBoundingClientRect();x.set((e.clientX-rect.left)/rect.width-0.5);y.set((e.clientY-rect.top)/rect.height-0.5)}} 
        onMouseLeave={()=>{x.set(0);y.set(0)}} 
        onClick={onClick} // TRIGGER POPUP
        className="relative group perspective-1000 cursor-pointer"
    >
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 h-full flex flex-col">
            <div className="h-64 overflow-hidden relative">
                <img src={member.foto_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 grayscale group-hover:grayscale-0" alt={member.nama}/>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-bold text-lg leading-tight">{member.nama}</p>
                    <p className="text-xs text-purple-400 uppercase tracking-widest font-bold">{member.jabatan}</p>
                </div>
            </div>
            <div className="p-6 flex-grow bg-white dark:bg-[#111]">
                <div className="flex gap-2 mb-3">
                    <span className="w-8 h-1 bg-purple-500 rounded-full"></span>
                    <span className="w-2 h-1 bg-gray-300 dark:bg-white/20 rounded-full"></span>
                </div>
                <p className="text-gray-600 dark:text-zinc-400 text-sm italic leading-relaxed line-clamp-2">
                    "{member.motto || 'Never stop learning.'}"
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-4 font-bold uppercase tracking-wider group-hover:underline">Lihat Profil →</p>
            </div>
        </div>
    </motion.div>
  );
}

// --- KOMPONEN: POPUP DETAIL (MODAL BARU) ---
function MemberModal({ member, onClose }) {
    if (!member) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* BACKDROP BLUR */}
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            ></motion.div>

            {/* MODAL CONTENT */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 50 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
                {/* Bagian Foto Besar */}
                <div className="md:w-2/5 h-64 md:h-auto relative">
                    <img src={member.foto_url} className="w-full h-full object-cover" alt={member.nama}/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r"></div>
                </div>

                {/* Bagian Detail Teks */}
                <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center relative">
                    <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-500 transition">✕</button>
                    
                    <div className="mb-6">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full uppercase tracking-widest">{member.divisi}</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-1">{member.nama}</h2>
                    <p className="text-lg text-purple-600 dark:text-purple-400 font-bold mb-6">{member.jabatan}</p>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="text-2xl">🎓</div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Nomor Induk</p>
                                <p className="text-gray-900 dark:text-white font-mono">{member.nim || "-"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="text-2xl">💬</div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Motto Hidup</p>
                                <p className="text-gray-700 dark:text-zinc-300 italic">"{member.motto || "Semangat terus pantang mundur!"}"</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                        <p className="text-center text-xs text-gray-400">© Himpunan Mahasiswa 2026</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function DivisiDetail() {
  const { nama_divisi } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // STATE POPUP
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost/himpunan-api/api.php?action=get_pengurus`);
        if (Array.isArray(res.data)) {
            const filtered = res.data.filter(m => m.divisi && m.divisi.toLowerCase().includes(nama_divisi.replace(/-/g, ' ').toLowerCase()));
            setMembers(filtered);
        }
      } catch (e) {} finally { setLoading(false); }
    };
    fetchData();
  }, [nama_divisi]);

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 relative">
      
      {/* HEADER */}
      <div className="text-center mb-16 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px] -z-10"></div>
        <h1 className="text-5xl md:text-8xl font-black mb-4 tracking-tighter text-gray-900 dark:text-white opacity-90 uppercase">{nama_divisi.replace(/-/g, ' ')}</h1>
        <p className="text-xl text-gray-500 dark:text-zinc-400">Struktur Anggota & Pengurus</p>
      </div>

      {/* GRID ANGGOTA */}
      <div className="container mx-auto max-w-6xl relative z-10">
         {loading ? (
             <p className="text-center text-zinc-500 animate-pulse">Sedang memuat data...</p>
         ) : members.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {members.map((item, i) => (
                    <MemberCard 
                        key={i} 
                        member={item} 
                        onClick={() => setSelectedMember(item)} // SET DATA KE STATE
                    />
                ))}
             </div>
         ) : (
             <div className="text-center py-20 border border-dashed border-gray-300 dark:border-zinc-800 rounded-3xl">
                 <p className="text-gray-500 dark:text-zinc-500 text-xl">Belum ada anggota di divisi ini.</p>
             </div>
         )}
      </div>

      {/* MODAL POPUP AREA */}
      <AnimatePresence>
          {selectedMember && (
              <MemberModal 
                  member={selectedMember} 
                  onClose={() => setSelectedMember(null)} 
              />
          )}
      </AnimatePresence>

    </div>
  );
}