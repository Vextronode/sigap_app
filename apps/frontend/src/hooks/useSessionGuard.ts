import { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isTokenExpired, useAuthStore } from "../stores/authStore";

/**
 * Hook pelindung sesi admin & operator secara global (Global Session Guard).
 * 
 * Bertanggung jawab memantau status keaktifan sesi di browser:
 * - Menangani token JWT yang telah kedaluwarsa baik saat admin di halaman admin maupun portal warga.
 * - Memeriksa waktu kedaluwarsa secara in-memory (0 network request, 0 limit/kuota server).
 * - Berjalan berkala (heartbeat) tiap 30 detik serta saat tab kembali difokuskan (window focus & visibilitychange).
 * - Mengalihkan staf/admin otomatis ke /admin/login?expired=true saat masa aktif habis.
 */
export function useSessionGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const checkSession = useCallback(() => {
    // Abaikan jika saat ini pengguna memang sudah berada di halaman login
    if (location.pathname.startsWith("/login") || location.pathname.startsWith("/admin/login")) {
      return;
    }

    const rawToken = localStorage.getItem("sigap_token");
    const wasSessionExpired =
      typeof window !== "undefined" &&
      sessionStorage.getItem("sigap_session_expired") === "true";

    // Kasus 1: Sesi sebelumnya terdeteksi expired saat inisialisasi awal authStore
    if (wasSessionExpired) {
      sessionStorage.removeItem("sigap_session_expired");
      logout();
      navigate("/admin/login?expired=true", { replace: true });
      return;
    }

    // Kasus 2: Pengguna memiliki token di storage (staf/admin terdaftar), namun masa berlakunya sudah habis
    if (rawToken && isTokenExpired(rawToken)) {
      sessionStorage.setItem("sigap_session_expired", "true");
      logout();
      navigate("/admin/login?expired=true", { replace: true });
      return;
    }

    // Kasus 3: State token di memory Zustand ada dan terdeteksi kedaluwarsa
    const currentMemoryToken = useAuthStore.getState().token;
    if (currentMemoryToken && isTokenExpired(currentMemoryToken)) {
      sessionStorage.setItem("sigap_session_expired", "true");
      logout();
      navigate("/admin/login?expired=true", { replace: true });
      return;
    }
  }, [navigate, location.pathname, logout]);

  useEffect(() => {
    // 1. Periksa langsung saat komponen MainLayout mount atau rute berpindah
    checkSession();

    // 2. Heartbeat berkala di browser setiap 30 detik (ringan, in-memory CPU perbandingan timestamp)
    const intervalId = window.setInterval(checkSession, 30_000);

    // 3. Periksa saat tab browser kembali aktif setelah diminimize / berpindah tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    const handleFocus = () => {
      checkSession();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkSession]);
}
