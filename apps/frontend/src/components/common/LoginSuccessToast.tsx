import React, { useEffect, useState } from "react";
import { GoPasskeyFill } from "react-icons/go";
import { X } from "lucide-react";

export interface LoginToastData {
  role: string;
  name?: string;
  timestamp?: number;
}

interface LoginSuccessToastProps {
  durationMs?: number;
}

function getStoredLoginToast(): LoginToastData | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem("sigap_login_toast");
    if (stored) {
      sessionStorage.removeItem("sigap_login_toast");
      return JSON.parse(stored) as LoginToastData;
    }
  } catch {
    // Abaikan jika parsing storage gagal
  }
  return null;
}

export const LoginSuccessToast: React.FC<LoginSuccessToastProps> = ({
  durationMs = 7000,
}) => {
  const [toastData, setToastData] = useState<LoginToastData | null>(getStoredLoginToast);
  const [isVisible, setIsVisible] = useState(() => Boolean(toastData));
  const [isExiting, setIsExiting] = useState(false);

  // Listener event khusus jika dipicu secara terprogram
  useEffect(() => {
    const handleCustomToast = (event: Event) => {
      const customEvent = event as CustomEvent<LoginToastData>;
      if (customEvent.detail) {
        setToastData(customEvent.detail);
        setIsVisible(true);
        setIsExiting(false);
      }
    };

    window.addEventListener("sigap:login-success", handleCustomToast);
    return () => {
      window.removeEventListener("sigap:login-success", handleCustomToast);
    };
  }, []);

  // Timer auto-close untuk menghilangkan pop-up saat progress bar selesai (7 detik)
  useEffect(() => {
    if (!isVisible || !toastData) return;

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsExiting(false);
        setToastData(null);
      }, 200);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [isVisible, toastData, durationMs]);

  const handleManualClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      setToastData(null);
    }, 200);
  };

  if (!isVisible || !toastData) return null;

  const isOperator = toastData.role.toLowerCase().includes("operator");
  const roleTitle = isOperator ? "Operator" : "Administrator";
  const displayName = toastData.name?.trim() || roleTitle;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-[84px] sm:top-[90px] inset-x-0 lg:left-[var(--sidebar-width)] z-50 pointer-events-none flex justify-center px-4"
    >
      {/* Kotak Horizontal Ramping (Kotak Panjang Kompak) */}
      <div
        className={`login-toast-card pointer-events-auto relative w-full max-w-sm sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border overflow-hidden shadow-xl transition-all duration-200 ${
          isExiting
            ? "opacity-0 -translate-y-2 scale-95"
            : "opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-top-3 duration-300"
        } ${
          isOperator
            ? "border-blue-200/90 dark:border-blue-900/70 shadow-blue-950/10 dark:shadow-blue-950/30"
            : "border-rose-200/90 dark:border-rose-900/70 shadow-rose-950/10 dark:shadow-rose-950/30"
        }`}
      >
        {/* Konten Pop-Up Horizontal */}
        <div className="p-3.5 sm:p-4 flex items-center gap-3 sm:gap-3.5">
          {/* Ikon Passkey Bulat dengan Denyut Lembut */}
          <div className="relative flex items-center justify-center shrink-0">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-30 animate-pulse ${
                isOperator
                  ? "bg-blue-400 dark:bg-blue-500"
                  : "bg-rose-400 dark:bg-rose-500"
              }`}
            />
            <div
              className={`relative w-10 h-10 rounded-full flex items-center justify-center border shadow-2xs ${
                isOperator
                  ? "bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800 text-[#00247D] dark:text-blue-400"
                  : "bg-rose-50 dark:bg-rose-950/70 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400"
              }`}
            >
              {/* Ikon Passkey statis tanpa efek denyut */}
              <GoPasskeyFill size={20} />
            </div>
          </div>

          {/* Teks Informasi: SELAMAT DATANG Capslock + Nama Akun Casing Asli */}
          <div className="flex-1 min-w-0 pr-1 text-left">
            <h4 className="text-xs sm:text-sm text-slate-900 dark:text-white leading-snug truncate">
              <span className="font-extrabold uppercase">SELAMAT DATANG, </span>
              <span className="font-extrabold">{displayName}!</span>
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal truncate">
              Berhasil login sebagai{" "}
              <span
                className={`font-semibold ${
                  isOperator
                    ? "text-[#00247D] dark:text-blue-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {roleTitle}
              </span>
            </p>
          </div>

          {/* Tombol Tutup (X) */}
          <button
            type="button"
            onClick={handleManualClose}
            className="p-1.5 -mr-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Tutup notifikasi login"
          >
            <X size={16} />
          </button>
        </div>

        {/* Garis Loading Bar di Bagian Kotak Bawah (7 Detik) */}
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
          <div
            className={`h-full animate-login-progress ${
              isOperator
                ? "bg-[#00247D] dark:bg-blue-500"
                : "bg-rose-600 dark:bg-rose-500"
            }`}
            style={
              {
                "--toast-duration": `${durationMs}ms`,
              } as React.CSSProperties
            }
          />
        </div>
      </div>
    </div>
  );
};
