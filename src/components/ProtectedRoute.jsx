import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // Cek apakah ada 'tiket' admin di local storage
    const isAdmin = localStorage.getItem('isAdmin');

    // Jika ada, izinkan masuk (render halaman tujuan / Outlet)
    // Jika tidak, tendang ke halaman login
    return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;