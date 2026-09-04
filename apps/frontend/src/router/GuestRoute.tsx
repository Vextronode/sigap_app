import { Navigate, Outlet } from "react-router-dom";

// pengarah rute untuk mencegah pengguna yang sudah login mengakses halaman login
export const GuestRoute = () => {
  const token = localStorage.getItem("sigap_token");

  // alihkan ke halaman utama jika token sudah tersimpan
  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
