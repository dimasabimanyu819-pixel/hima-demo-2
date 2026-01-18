import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('username', username);
    fd.append('password', password);

    try {
      const res = await axios.post('http://localhost/himpunan-api/api.php?action=login', fd);
      if (res.data.status === 'success') {
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin');
      } else {
        alert("Login Gagal! Cek username/password.");
      }
    } catch (err) { alert("Error Server"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#050505] relative overflow-hidden transition-colors duration-300">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/20 blur-[150px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="relative z-10 bg-white/70 dark:bg-black/60 backdrop-blur-2xl border border-white/20 dark:border-white/10 p-10 rounded-[2.5rem] shadow-2xl w-full max-w-sm"
      >
        <div className="text-center mb-8">
            <h2 className="text-3xl font-black mb-2 tracking-tight text-gray-900 dark:text-white">Admin <span className="text-purple-600 dark:text-purple-500">Access</span></h2>
            <p className="text-gray-500 dark:text-zinc-500 text-sm">Masuk untuk mengelola konten website.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-2">Username</label>
              <input type="text" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition" value={username} onChange={e=>setUsername(e.target.value)} placeholder="admin" required />
          </div>
          <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-2">Password</label>
              <input type="password" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••" required />
          </div>
          <button className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl hover:opacity-80 transition shadow-lg transform active:scale-95">
              MASUK DASHBOARD
          </button>
        </form>
        
        <button onClick={()=>navigate('/')} className="w-full mt-8 text-gray-400 dark:text-zinc-600 text-xs hover:text-purple-500 transition">
            &larr; Kembali ke Website Utama
        </button>
      </motion.div>
    </div>
  );
}