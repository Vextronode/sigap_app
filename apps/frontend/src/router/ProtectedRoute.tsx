import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isTokenExpired, useAuthStore } from "../stores/authStore";

// Pelindung rute untuk memastikan hanya pengguna terautentikasi dengan token valid yang dapat mengakses rute admin
export const ProtectedRoute = () => {
  const { token, isAdmin, validateSession } = useAuthStore();
  const location = useLocation();

  const isExpired = !token || isTokenExpired(token);

  useEffect(() => {
    if (isExpired) {
      validateSession();
    }
  }, [isExpired, validateSession]);

  const wasSessionExpired =
    typeof window !== "undefined" &&
    sessionStorage.getItem("sigap_session_expired") === "true";

  if (!token || !isAdmin || isExpired) {
    const targetUrl = wasSessionExpired ? "/admin/login?expired=true" : "/admin/login";
    return (
      <Navigate
        to={targetUrl}
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
};
