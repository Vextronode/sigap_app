import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

// Pelindung rute untuk memastikan hanya pengguna terautentikasi dengan token valid yang dapat mengakses rute admin
export const ProtectedRoute = () => {
  const { token, isAdmin, validateSession } = useAuthStore();
  const location = useLocation();

  const isSessionValid = validateSession();

  if (!token || !isAdmin || !isSessionValid) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
};
