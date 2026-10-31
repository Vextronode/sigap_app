import { Bell, BellOff, BellRing, Share } from "lucide-react";
import { usePushNotification } from "../../../hooks/usePushNotification";
import { cn } from "../../../utils/cn";

/**
 * Prompt aktivasi notifikasi push — khusus gempa/tsunami sekitar Desa Cibenda/Pangandaran.
 * Komponen kompak berbentuk pill modern yang ditempatkan di paling atas status alert.
 * Ukuran teks, ikon, padding, dan tombol secara keseluruhan diperkecil di layar handphone
 * agar tampil proporsional tanpa teks terpotong.
 */
export const NotificationPrompt = () => {
  const {
    supported,
    needsIosInstall,
    permission,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotification();

  if (!supported) return null;

  if (needsIosInstall) {
    return (
      <div className="w-full max-w-full flex justify-center px-1 box-border">
        <div className="inline-flex max-w-full items-center gap-1.5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 shadow-2xs backdrop-blur-md text-[9.5px] sm:text-xs text-blue-900 dark:text-blue-200 min-w-0">
          <Share className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
          <span className="font-medium text-[9px] sm:text-xs leading-tight">
            Di iOS: Tambah SIGAP ke <strong>Layar Utama</strong> untuk aktifkan notifikasi
          </span>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="w-full max-w-full flex justify-center px-1 box-border">
        <div className="inline-flex max-w-full items-center gap-1.5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs backdrop-blur-md text-[9.5px] sm:text-xs text-slate-700 dark:text-slate-300 min-w-0">
          <BellOff className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span className="font-medium text-[9px] sm:text-xs leading-tight">
            Izin notifikasi diblokir browser. Aktifkan di pengaturan browser kamu.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full flex flex-col items-center px-1 box-border">
      <div
        className={cn(
          "w-full max-w-sm sm:max-w-md inline-flex items-center justify-between gap-1.5 sm:gap-3.5 px-2 py-1 sm:px-4 sm:py-2 rounded-full border shadow-2xs backdrop-blur-md transition-all box-border min-w-0",
          isSubscribed
            ? "bg-emerald-50/95 dark:bg-emerald-950/60 border-emerald-300/90 dark:border-emerald-700/80 text-emerald-900 dark:text-emerald-100 shadow-emerald-500/10"
            : "bg-white/95 dark:bg-slate-900/95 border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800/80 shadow-xs"
        )}
      >
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
          {/* Ikon Lonceng */}
          <div
            className={cn(
              "flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border shadow-2xs transition-colors",
              isSubscribed
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                : "bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 border-blue-100 dark:border-blue-900/60"
            )}
          >
            {isSubscribed ? (
              <BellRing className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            ) : (
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            )}
          </div>

          {/* Teks Judul dan Deskripsi */}
          <div className="flex flex-col min-w-0 flex-1 text-left">
            <div className="flex items-center gap-1 min-w-0">
              {isSubscribed && (
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
              )}
              <span
                className={cn(
                  "text-[10px] sm:text-[12.5px] font-bold leading-tight",
                  isSubscribed
                    ? "text-emerald-800 dark:text-emerald-300"
                    : "text-slate-900 dark:text-slate-100"
                )}
              >
                {isSubscribed ? "Notifikasi Gempa Bumi Aktif" : "Aktifkan Notifikasi Gempa Bumi"}
              </span>
            </div>

            <span
              className={cn(
                "text-[8px] sm:text-[10.5px] font-medium leading-tight mt-0.5",
                isSubscribed
                  ? "text-emerald-700/80 dark:text-emerald-400/80"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              Notifikasi Siaga Real-Time Gempa Pangandaran
            </span>
          </div>
        </div>

        {/* Tombol Aksi: Aktifkan / Matikan */}
        <button
          type="button"
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={loading}
          className={cn(
            "shrink-0 rounded-full font-bold transition-all disabled:opacity-60 cursor-pointer active:scale-95 text-[9.5px] sm:text-xs",
            isSubscribed
              ? "px-2 py-0.5 sm:px-3 sm:py-1 font-semibold text-emerald-800 hover:text-rose-600 dark:text-emerald-300 dark:hover:text-rose-400 bg-emerald-100/70 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-emerald-300/80 dark:border-emerald-700"
              : "px-2.5 py-0.5 sm:px-3.5 sm:py-1.5 text-white bg-blue-600 hover:bg-blue-700 shadow-2xs"
          )}
        >
          {loading ? "..." : isSubscribed ? "Matikan" : "Aktifkan"}
        </button>
      </div>

      {error && (
        <span className="mt-1 text-[9px] sm:text-[11px] text-rose-500 dark:text-rose-400 font-medium text-center max-w-full">
          {error}
        </span>
      )}
    </div>
  );
};
