import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Admin() {
  const navigate = useNavigate();
  const BASE_URL = "http://localhost/himpunan-api/api.php";

  // --- STATE TABS ---
  const [activeTab, setActiveTab] = useState("konten"); // 'konten', 'keuangan', 'administrasi'

  // --- STATE DATA ---
  const [inputProfil, setInputProfil] = useState({ nama: "", visi: "", misi: "", instagram: "", tiktok: "", youtube: "", email: "", logo: null });
  const [formAnggota, setFormAnggota] = useState({ nama: "", nim: "", jabatan: "", divisi: "BPH", motto: "", foto: null });
  const [formEvent, setFormEvent] = useState({ judul: "", tanggal: "", deskripsi: "", poster: null, mulai: "", selesai: "", lokasi: "", kapasitas: "", batas: "", pemateri: "", cp: "", benefits: "", kategori: "Umum", status: "Open" });
  const [formGallery, setFormGallery] = useState({ judul: "", foto: null });
  
  // STATE KEUANGAN & DOKUMEN
  const [formKeuangan, setFormKeuangan] = useState({ tipe: "Pemasukan", kategori: "", nominal: "", keterangan: "", tanggal: "" });
  const [formDokumen, setFormDokumen] = useState({ judul: "", kategori: "Surat Masuk", file: null });

  // LIST DATA
  const [pengurusList, setPengurusList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [galleryList, setGalleryList] = useState([]); // List Galeri
  const [keuanganList, setKeuanganList] = useState([]);
  const [dokumenList, setDokumenList] = useState([]);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) { alert("Akses Ditolak"); navigate('/login'); } else { fetchAll(); }
  }, []);

  const fetchAll = async () => {
      try {
        // Fetch Konten
        const p = await axios.get(`${BASE_URL}?action=get_profil`);
        if(p.data) setInputProfil({ 
            nama: p.data.nama_himpunan, 
            visi: p.data.visi||"", 
            misi: p.data.misi||"", 
            instagram: p.data.instagram||"", 
            tiktok: p.data.tiktok||"", 
            youtube: p.data.youtube||"", 
            email: p.data.email||"", 
            logo: null 
        });
        const s = await axios.get(`${BASE_URL}?action=get_pengurus`); setPengurusList(Array.isArray(s.data)?s.data:[]);
        const e = await axios.get(`${BASE_URL}?action=get_events`); setEventsList(Array.isArray(e.data)?e.data:[]);
        const g = await axios.get(`${BASE_URL}?action=get_gallery`); setGalleryList(Array.isArray(g.data)?g.data:[]); // Fetch Galeri
        
        // Fetch Keuangan & Dokumen
        const k = await axios.get(`${BASE_URL}?action=get_keuangan`); setKeuanganList(Array.isArray(k.data)?k.data:[]);
        const d = await axios.get(`${BASE_URL}?action=get_dokumen`); setDokumenList(Array.isArray(d.data)?d.data:[]);
      } catch(e){}
  };

  const handleLogout = () => { localStorage.removeItem('isAdmin'); navigate('/login'); };

  const submitForm = async (e, action, fd, callback) => {
      e.preventDefault();
      try { await axios.post(`${BASE_URL}?action=${action}`, fd); alert("Berhasil Disimpan!"); callback(); fetchAll(); } 
      catch (err) { alert("Gagal menyimpan data"); }
  };

  const handleDelete = async (type, id) => {
      if(confirm("Yakin hapus?")) {
          const fd = new FormData(); fd.append('id', id);
          let act = `delete_${type}`; // delete_gallery, delete_event, dll
          await axios.post(`${BASE_URL}?action=${act}`, fd); fetchAll();
      }
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  const inputClass = "w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none transition text-sm";
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase mb-1 mt-2";
  const cardClass = "bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-sm";
  const tabClass = (isActive) => `px-6 py-3 rounded-full font-bold text-sm transition ${isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-white dark:bg-zinc-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`;

  const totalPemasukan = keuanganList.filter(k=>k.tipe==='Pemasukan').reduce((acc, curr)=> acc + Number(curr.nominal), 0);
  const totalPengeluaran = keuanganList.filter(k=>k.tipe==='Pengeluaran').reduce((acc, curr)=> acc + Number(curr.nominal), 0);
  const saldoAkhir = totalPemasukan - totalPengeluaran;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-200 font-sans p-6 md:p-12 transition-colors duration-300">
      <div className="container mx-auto max-w-6xl">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-200 dark:border-zinc-800 pb-6 gap-4">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">Dashboard <span className="text-purple-600 dark:text-purple-500">Admin</span></h1>
                <p className="text-gray-500 dark:text-zinc-500 text-sm">Sistem Informasi Manajemen Organisasi.</p>
            </div>
            <div className="flex gap-3">
                <button onClick={()=>navigate('/')} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-white px-5 py-2 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-zinc-800 transition">Lihat Website</button>
                <button onClick={handleLogout} className="bg-red-500 text-white px-5 py-2 rounded-lg font-bold hover:bg-red-600 transition shadow-lg shadow-red-500/30">Logout</button>
            </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start">
            <button onClick={()=>setActiveTab('konten')} className={tabClass(activeTab==='konten')}>🌐 Konten Website</button>
            <button onClick={()=>setActiveTab('keuangan')} className={tabClass(activeTab==='keuangan')}>💰 Keuangan (Bendahara)</button>
            <button onClick={()=>setActiveTab('administrasi')} className={tabClass(activeTab==='administrasi')}>📂 Administrasi (Sekretaris)</button>
        </div>

        {/* ================= TAB 1: KONTEN WEBSITE ================= */}
        {activeTab === 'konten' && (
            <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* EDIT PROFIL */}
                    <div className={cardClass}>
                        <h3 className="font-bold text-xl mb-6">🏢 Profil Organisasi</h3>
                        <form onSubmit={(e)=>{ const fd=new FormData(); Object.keys(inputProfil).forEach(k=>fd.append(k==='nama'?'nama_himpunan':k, inputProfil[k])); submitForm(e, 'update_profil', fd, ()=>{}); }}>
                            <label className={labelClass}>Nama Himpunan</label><input type="text" value={inputProfil.nama} onChange={e=>setInputProfil({...inputProfil, nama:e.target.value})} className={inputClass} />
                            
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div><label className={labelClass}>Instagram</label><input type="text" value={inputProfil.instagram} onChange={e=>setInputProfil({...inputProfil, instagram:e.target.value})} className={inputClass} /></div>
                                <div><label className={labelClass}>TikTok</label><input type="text" value={inputProfil.tiktok} onChange={e=>setInputProfil({...inputProfil, tiktok:e.target.value})} className={inputClass} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div><label className={labelClass}>YouTube</label><input type="text" value={inputProfil.youtube} onChange={e=>setInputProfil({...inputProfil, youtube:e.target.value})} className={inputClass} /></div>
                                <div><label className={labelClass}>Email</label><input type="text" value={inputProfil.email} onChange={e=>setInputProfil({...inputProfil, email:e.target.value})} className={inputClass} /></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div><label className={labelClass}>Visi</label><textarea value={inputProfil.visi} onChange={e=>setInputProfil({...inputProfil, visi:e.target.value})} className={inputClass} rows="2"></textarea></div>
                                <div><label className={labelClass}>Misi</label><textarea value={inputProfil.misi} onChange={e=>setInputProfil({...inputProfil, misi:e.target.value})} className={inputClass} rows="2"></textarea></div>
                            </div>
                            <label className={labelClass}>Logo</label><input type="file" onChange={e=>setInputProfil({...inputProfil, logo:e.target.files[0]})} className="text-sm text-gray-500 w-full mb-4" />
                            <button className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-2 rounded-lg hover:opacity-80">Simpan Perubahan</button>
                        </form>
                    </div>

                    {/* TAMBAH ANGGOTA */}
                    <div className={cardClass}>
                        <h3 className="font-bold text-xl mb-6">👥 Tambah Anggota</h3>
                        <form onSubmit={(e)=>{ const fd=new FormData(); Object.keys(formAnggota).forEach(k=>fd.append(k, formAnggota[k])); submitForm(e, 'add_pengurus', fd, ()=>setFormAnggota({nama:"", nim:"", jabatan:"", divisi: "BPH", motto:"", foto:null})); }}>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelClass}>Nama</label><input type="text" value={formAnggota.nama} onChange={e=>setFormAnggota({...formAnggota, nama:e.target.value})} className={inputClass} /></div>
                                <div><label className={labelClass}>NIM</label><input type="text" value={formAnggota.nim} onChange={e=>setFormAnggota({...formAnggota, nim:e.target.value})} className={inputClass} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div><label className={labelClass}>Divisi</label><select value={formAnggota.divisi} onChange={e=>setFormAnggota({...formAnggota, divisi:e.target.value})} className={inputClass}>{["BPH", "Divisi IPTEK", "Divisi Kominfo", "Divisi PSDM", "Divisi Humas", "Divisi Danus"].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
                                <div><label className={labelClass}>Jabatan</label><input type="text" value={formAnggota.jabatan} onChange={e=>setFormAnggota({...formAnggota, jabatan:e.target.value})} className={inputClass} /></div>
                            </div>
                            <label className={labelClass}>Motto Hidup</label><input type="text" value={formAnggota.motto} onChange={e=>setFormAnggota({...formAnggota, motto:e.target.value})} className={inputClass} placeholder="Contoh: Tetap Semangat!" />
                            <label className={labelClass}>Foto</label><input type="file" onChange={e=>setFormAnggota({...formAnggota, foto:e.target.files[0]})} className="text-sm text-gray-500 w-full mb-4" required />
                            <button className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700">Tambah Anggota</button>
                        </form>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* TAMBAH EVENT */}
                    <div className={cardClass}>
                        <h3 className="font-bold text-xl mb-4">📅 Buat Event Baru</h3>
                        <form onSubmit={(e)=>{
                            const fd=new FormData(); 
                            fd.append('judul', formEvent.judul); fd.append('tanggal', formEvent.tanggal); fd.append('deskripsi', formEvent.deskripsi); fd.append('poster', formEvent.poster);
                            fd.append('waktu_mulai', formEvent.mulai); fd.append('waktu_selesai', formEvent.selesai); fd.append('lokasi', formEvent.lokasi); 
                            fd.append('kapasitas', formEvent.kapasitas); fd.append('batas_pendaftaran', formEvent.batas); 
                            fd.append('pemateri', formEvent.pemateri); fd.append('contact_person', formEvent.cp); 
                            fd.append('benefits', formEvent.benefits); fd.append('kategori', formEvent.kategori); fd.append('status_pendaftaran', formEvent.status);
                            submitForm(e, 'add_event', fd, ()=>setFormEvent({judul:"", tanggal:"", deskripsi:"", poster:null, mulai:"", selesai:"", lokasi:"", kapasitas:"", batas:"", pemateri:"", cp:"", benefits:"", kategori:"Umum", status:"Open"}));
                        }}>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" value={formEvent.judul} onChange={e=>setFormEvent({...formEvent, judul:e.target.value})} className={inputClass} placeholder="Judul Event" required/>
                                <input type="text" value={formEvent.pemateri} onChange={e=>setFormEvent({...formEvent, pemateri:e.target.value})} className={inputClass} placeholder="Pemateri"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <input type="date" value={formEvent.tanggal} onChange={e=>setFormEvent({...formEvent, tanggal:e.target.value})} className={inputClass} required/>
                                <input type="text" value={formEvent.lokasi} onChange={e=>setFormEvent({...formEvent, lokasi:e.target.value})} className={inputClass} placeholder="Lokasi"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <input type="text" value={formEvent.cp} onChange={e=>setFormEvent({...formEvent, cp:e.target.value})} className={inputClass} placeholder="CP (WA)"/>
                                <input type="text" value={formEvent.benefits} onChange={e=>setFormEvent({...formEvent, benefits:e.target.value})} className={inputClass} placeholder="Benefit"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <input type="time" value={formEvent.mulai} onChange={e=>setFormEvent({...formEvent, mulai:e.target.value})} className={inputClass} />
                                <input type="time" value={formEvent.selesai} onChange={e=>setFormEvent({...formEvent, selesai:e.target.value})} className={inputClass} />
                            </div>
                            <textarea value={formEvent.deskripsi} onChange={e=>setFormEvent({...formEvent, deskripsi:e.target.value})} className={`${inputClass} mt-2`} rows="2" placeholder="Deskripsi..."></textarea>
                            <input type="file" onChange={e=>setFormEvent({...formEvent, poster:e.target.files[0]})} className="text-sm text-gray-500 w-full mt-2" required/>
                            <button className="bg-cyan-600 text-white font-bold py-2 rounded-lg hover:bg-cyan-700 w-full mt-4">Publikasi Event</button>
                        </form>
                    </div>

                    {/* TAMBAH GALERI (FORM) */}
                    <div className={cardClass}>
                        <h3 className="font-bold text-xl mb-6">📸 Tambah Galeri</h3>
                        <form onSubmit={(e)=>{
                            const fd=new FormData(); fd.append('judul', formGallery.judul); fd.append('foto', formGallery.foto);
                            submitForm(e, 'add_gallery', fd, ()=>setFormGallery({judul:"", foto:null}));
                        }}>
                            <label className={labelClass}>Judul / Caption</label>
                            <input type="text" value={formGallery.judul} onChange={e=>setFormGallery({...formGallery, judul:e.target.value})} className={inputClass} placeholder="Contoh: Makrab 2024" required />
                            
                            <label className={labelClass}>Foto Dokumentasi</label>
                            <input type="file" onChange={e=>setFormGallery({...formGallery, foto:e.target.files[0]})} className="text-sm text-gray-500 w-full mb-4" required />
                            
                            <button className="w-full bg-pink-600 text-white font-bold py-2 rounded-lg hover:bg-pink-500">Upload Foto</button>
                        </form>
                    </div>
                </div>

                {/* === LIST DATA (PREVIEW) === */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-800 pb-4 mt-8">Manajemen Konten</h2>

                {/* 1. LIST EVENT */}
                <div>
                    <h3 className="text-lg font-bold text-gray-500 dark:text-zinc-400 mb-4 uppercase tracking-wider">Daftar Event</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {eventsList.map((ev, i) => (
                            <div key={i} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-zinc-800 rounded-xl p-3 flex gap-3 items-center relative group">
                                <img src={ev.poster_url} className="w-12 h-12 object-cover rounded-lg"/>
                                <div className="flex-1 overflow-hidden"><h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{ev.judul}</h4><p className="text-xs text-gray-500">{ev.tanggal}</p></div>
                                <button onClick={() => handleDelete('event', ev.id)} className="text-red-500 text-xs hover:bg-red-50 px-2 py-1 rounded">Hapus</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. LIST GALERI (YANG TADI HILANG SUDAH ADA DISINI) */}
                <div>
                    <h3 className="text-lg font-bold text-gray-500 dark:text-zinc-400 mb-4 uppercase tracking-wider">Daftar Dokumentasi</h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        {galleryList.map((gal, i) => (
                            <div key={i} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-zinc-800 rounded-xl p-2 relative group hover:shadow-lg transition">
                                <img src={gal.foto_url} className="w-full h-32 object-cover rounded-lg"/>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                                    <button onClick={() => handleDelete('gallery', gal.id)} className="bg-red-600 text-white text-xs px-3 py-1 rounded-full hover:scale-105 transition">Hapus</button>
                                </div>
                                <p className="text-xs font-bold mt-2 truncate text-gray-700 dark:text-gray-300 text-center">{gal.judul}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. LIST ANGGOTA */}
                <div>
                    <h3 className="text-lg font-bold text-gray-500 dark:text-zinc-400 mb-4 uppercase tracking-wider">Daftar Anggota</h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        {pengurusList.map((item, i) => (
                            <div key={i} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-zinc-800 rounded-xl p-4 text-center relative group">
                                <img src={item.foto_url} className="w-16 h-16 rounded-full mx-auto object-cover mb-2"/>
                                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.nama}</p>
                                <button onClick={() => handleDelete('pengurus', item.id)} className="absolute top-2 right-2 text-red-500 bg-white dark:bg-black rounded-full w-6 h-6 shadow hover:bg-red-500 hover:text-white transition">×</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* ================= TAB 2: KEUANGAN (BENDAHARA) ================= */}
        {activeTab === 'keuangan' && (
            <div className="space-y-8 animate-fade-in">
                {/* RINGKASAN SALDO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-green-100 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
                        <p className="text-green-600 dark:text-green-400 font-bold uppercase text-xs">Total Pemasukan</p>
                        <h3 className="text-2xl font-black text-green-700 dark:text-green-300">{formatRupiah(totalPemasukan)}</h3>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
                        <p className="text-red-600 dark:text-red-400 font-bold uppercase text-xs">Total Pengeluaran</p>
                        <h3 className="text-2xl font-black text-red-700 dark:text-red-300">{formatRupiah(totalPengeluaran)}</h3>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                        <p className="text-blue-600 dark:text-blue-400 font-bold uppercase text-xs">Saldo Saat Ini</p>
                        <h3 className="text-2xl font-black text-blue-700 dark:text-blue-300">{formatRupiah(saldoAkhir)}</h3>
                    </div>
                </div>

                {/* FORM TRANSAKSI */}
                <div className={cardClass}>
                    <h3 className="font-bold text-xl mb-4">➕ Catat Transaksi Baru</h3>
                    <form onSubmit={(e)=>{ const fd=new FormData(); Object.keys(formKeuangan).forEach(k=>fd.append(k, formKeuangan[k])); submitForm(e, 'add_keuangan', fd, ()=>setFormKeuangan({tipe:"Pemasukan", kategori:"", nominal:"", keterangan:"", tanggal:""})); }}>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div><label className={labelClass}>Tipe</label><select value={formKeuangan.tipe} onChange={e=>setFormKeuangan({...formKeuangan, tipe:e.target.value})} className={inputClass}><option>Pemasukan</option><option>Pengeluaran</option></select></div>
                            <div><label className={labelClass}>Tanggal</label><input type="date" value={formKeuangan.tanggal} onChange={e=>setFormKeuangan({...formKeuangan, tanggal:e.target.value})} className={inputClass} required/></div>
                            <div><label className={labelClass}>Kategori</label><input type="text" placeholder="Uang Kas / Event" value={formKeuangan.kategori} onChange={e=>setFormKeuangan({...formKeuangan, kategori:e.target.value})} className={inputClass} required/></div>
                            <div><label className={labelClass}>Nominal (Rp)</label><input type="number" placeholder="50000" value={formKeuangan.nominal} onChange={e=>setFormKeuangan({...formKeuangan, nominal:e.target.value})} className={inputClass} required/></div>
                            <button className="bg-cyan-600 text-white font-bold py-2 rounded-lg hover:bg-cyan-700 h-[38px]">Simpan</button>
                        </div>
                        <input type="text" placeholder="Keterangan Detail..." value={formKeuangan.keterangan} onChange={e=>setFormKeuangan({...formKeuangan, keterangan:e.target.value})} className={`${inputClass} mt-4`} />
                    </form>
                </div>

                {/* TABEL KEUANGAN */}
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 dark:bg-black uppercase text-xs font-bold text-gray-500 dark:text-zinc-500">
                            <tr>
                                <th className="px-6 py-3">Tanggal</th>
                                <th className="px-6 py-3">Kategori</th>
                                <th className="px-6 py-3">Keterangan</th>
                                <th className="px-6 py-3 text-right">Nominal</th>
                                <th className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                            {keuanganList.map((k, i) => (
                                <tr key={i} className="bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-zinc-900">
                                    <td className="px-6 py-4">{k.tanggal}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${k.tipe==='Pemasukan'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{k.kategori}</span></td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-zinc-400">{k.keterangan}</td>
                                    <td className={`px-6 py-4 text-right font-bold ${k.tipe==='Pemasukan'?'text-green-600':'text-red-600'}`}>{k.tipe==='Pengeluaran'?'- ':''}{formatRupiah(k.nominal)}</td>
                                    <td className="px-6 py-4 text-center"><button onClick={()=>handleDelete('keuangan', k.id)} className="text-red-500 hover:underline">Hapus</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* ================= TAB 3: ADMINISTRASI (SEKRETARIS) ================= */}
        {activeTab === 'administrasi' && (
            <div className="space-y-8 animate-fade-in">
                {/* UPLOAD FORM */}
                <div className={cardClass}>
                    <h3 className="font-bold text-xl mb-4">📂 Arsip Dokumen</h3>
                    <form onSubmit={(e)=>{ const fd=new FormData(); fd.append('judul', formDokumen.judul); fd.append('kategori', formDokumen.kategori); fd.append('file', formDokumen.file); submitForm(e, 'add_dokumen', fd, ()=>setFormDokumen({judul:"", kategori:"Surat Masuk", file:null})); }}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="md:col-span-2"><label className={labelClass}>Judul Dokumen</label><input type="text" value={formDokumen.judul} onChange={e=>setFormDokumen({...formDokumen, judul:e.target.value})} className={inputClass} placeholder="Contoh: Surat Undangan Rektorat" required/></div>
                            <div><label className={labelClass}>Kategori</label><select value={formDokumen.kategori} onChange={e=>setFormDokumen({...formDokumen, kategori:e.target.value})} className={inputClass}><option>Surat Masuk</option><option>Surat Keluar</option><option>Proposal</option><option>LPJ</option><option>SK / Sertifikat</option></select></div>
                            <div className="relative"><input type="file" onChange={e=>setFormDokumen({...formDokumen, file:e.target.files[0]})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required/><div className="bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-center py-2 rounded-lg text-sm text-gray-500">{formDokumen.file ? formDokumen.file.name : "Pilih File (PDF/Doc)"}</div></div>
                        </div>
                        <button className="mt-4 bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700">Upload Arsip</button>
                    </form>
                </div>

                {/* LIST DOKUMEN */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dokumenList.map((d, i) => (
                        <div key={i} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-5 rounded-xl flex items-start gap-4 hover:shadow-lg transition">
                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center text-2xl">📄</div>
                            <div className="flex-1 overflow-hidden">
                                <h4 className="font-bold text-gray-900 dark:text-white truncate">{d.judul}</h4>
                                <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase mb-2">{d.kategori}</p>
                                <p className="text-xs text-gray-400 mb-3">{d.tanggal_upload}</p>
                                <div className="flex gap-3">
                                    <a href={d.file_url} target="_blank" className="text-xs bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded hover:bg-gray-200 transition">Download</a>
                                    <button onClick={()=>handleDelete('dokumen', d.id)} className="text-xs text-red-500 hover:underline">Hapus</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
}