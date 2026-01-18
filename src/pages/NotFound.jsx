import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#050505] text-center px-4 relative overflow-hidden">
      
      {/* Background Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-600 dark:text-zinc-400 mb-8 max-w-md mx-auto">
            Waduh! Sepertinya kamu tersesat di dimensi lain. Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        
        <Link to="/" className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full hover:scale-105 transition shadow-lg">
            Kembali ke Beranda
        </Link>
      </motion.div>
    </div>
  );
}