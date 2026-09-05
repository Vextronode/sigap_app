import { Navigate, Outlet } from "react-router-dom";

// pengarah rute untuk mencegah pengguna yang sudah login mengakses halaman login
export const GuestRoute = () => {
  const token = localStorage.getItem("sigap_token");

  // alihkan ke dashboard admin jika token sudah tersimpan
  if (token) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};
