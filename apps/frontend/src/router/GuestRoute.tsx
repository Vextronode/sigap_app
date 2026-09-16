import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore, isTokenExpired } from "../stores/authStore";

// Pengarah rute untuk mencegah pengguna yang sudah login aktif mengakses halaman login
export const GuestRoute = () => {
  const { token, isAdmin, logout } = useAuthStore();
  const rawToken = localStorage.getItem("sigap_token");

  // Jika token di storage ternyata sudah kedaluwarsa, bersihkan sesi dan izinkan form login tampil
  if (rawToken && isTokenExpired(rawToken)) {
    logout();
    return <Outlet />;
  }

  // Alihkan ke dashboard admin hanya jika pengguna memiliki token aktif dan valid
  if (token && isAdmin && !isTokenExpired(token)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};
