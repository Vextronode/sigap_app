import { AlertOctagon, AlertTriangle, ShieldAlert, RotateCw } from "lucide-react";
import { AiFillAlert } from "react-icons/ai";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import { cn } from "../../../utils/cn";
import type { CurrentAlert } from "../../../types/dashboard";
import { getAlertMeta } from "../../../utils/status";

const getDisplaySource = (source?: string) => {
  if (!source || source.toLowerCase() === "system" || source.toLowerCase() === "live-fallback") {
    return "Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)";
  }
  if (source.toUpperCase() === "BMKG") {
    return "Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)";
  }
  return source;
};

type CurrentAlertCardProps = {
  alert: CurrentAlert | null;
  isLoading?: boolean;
  isError?: boolean;
  showSystemStatus?: boolean;
};

const formatKeIndonesia = (dateString?: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  
  const opsi: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  const terformat = new Intl.DateTimeFormat('id-ID', opsi).format(date);
  return terformat.replace(' pukul ', ' - ').replace(':', '.') + ' WIB';
};

export const CurrentAlertCard = ({ 
  alert, 
  isLoading = false, 
  isError = false, 
  showSystemStatus = false 
}: CurrentAlertCardProps) => {
  // Jika terjadi error koneksi, tampilkan indikator offline/error secara stabil
  if (isError) {
    return (
      <section
        className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 text-center shadow-xs transition-all max-w-full overflow-hidden"
        aria-label="Pusat Pemantauan Bencana Offline"
      >
        <div className="relative flex items-center justify-center mx-auto mb-3 w-12 h-12">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-40 dark:bg-red-500" aria-hidden="true" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-red-200/60 bg-red-100 text-red-600 dark:border-red-800/40 dark:bg-red-950/50 dark:text-red-400 shadow-2xs">
            <AiFillAlert size={24} />
          </div>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Pusat Data Kesiapsiagaan Sedang Disinkronkan
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Terjadi gangguan koneksi data atau internet saat mengambil status kesiapsiagaan terbaru.
        </p>

        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 cursor-pointer"
          >
            <RotateCw size={15} className="animate-spin-once" />
            <span>Periksa & Muat Ulang</span>
          </button>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section
        className="card flex flex-col items-center gap-4 px-6 py-10 text-center max-w-full overflow-hidden"
        aria-label="Memuat status kesiapsiagaan"
      >
        <Skeleton className="h-[76px] w-[76px] !rounded-full" />
        <Skeleton className="h-9 w-40 !rounded-lg" />
        <Skeleton className="h-4 w-72 !rounded-lg" />
      </section>
    );
  }

  if (!alert) {
    return (
      <StateMessage
        title="Belum ada alert tersimpan"
        message="Scheduler belum menyimpan alert terbaru ke database."
      />
    );
  }

  const meta = getAlertMeta(alert);

  const renderStatusIcon = () => {
    switch (meta.tone) {
      case "safe":
        return (
          <div className="status-banner__icon-inner w-7 h-7 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center shadow-sm">
            <div className="status-banner__check-mark w-2 h-3.5 sm:w-3 sm:h-5 border-r-[2.5px] sm:border-r-[3.5px] border-b-[2.5px] sm:border-b-[3.5px] border-emerald-500 rotate-45 translate-y-[-1px] sm:translate-y-[-2px]" />
          </div>
        );
      case "warning":
        return <AlertOctagon size={46} strokeWidth={2.2} className="text-white status-banner__lucide-icon" aria-hidden="true" />;
      case "orange":
        return <ShieldAlert size={46} strokeWidth={2.2} className="text-white status-banner__lucide-icon" aria-hidden="true" />;
      case "danger":
      default:
        return <AlertTriangle size={46} strokeWidth={2.2} className="text-white status-banner__lucide-icon" aria-hidden="true" />;
    }
  };

  const getSystemMonitoringMeta = () => {
    if (isLoading) {
      return {
        label: "Memeriksa Sistem Pemantauan...",
        dotColor: "bg-slate-200",
      };
    }

    if (isError) {
      return {
        label: "Sistem Pemantauan Terganggu",
        dotColor: "bg-amber-400",
      };
    }

    return {
      label: "Sistem Pemantauan Aktif",
      dotColor: "bg-emerald-400",
    };
  };

  const monitoringMeta = getSystemMonitoringMeta();

  return (
    <section className={`status-banner status-banner--${meta.tone}`} aria-labelledby="status-title">
      {/* 
        Wadah Header Status:
        - Di Desktop (komputer/laptop): flex-col (ikon ceklis di atas, teks judul AMAN di bawah persis seperti dulu)
        - Di Mobile (layar handphone): flex-row (teks judul AMAN di kiri dan diperbesar, ikon ceklis di kanan)
      */}
      <div className="status-banner__header">
        <div className="status-banner__icon">
          <div className="status-banner__icon-bg relative">
            <div className="absolute inset-0 rounded-full bg-current opacity-70 animate-[ping_2s_infinite]" aria-hidden="true" />
            {renderStatusIcon()}
          </div>
        </div>

        <h1 id="status-title" className="text-white uppercase font-extrabold tracking-wide">
          {meta.label}
        </h1>
      </div>

      <p className="status-banner__description text-white leading-normal">
        {alert?.description ?? meta.description}
      </p>

      <div className="status-banner__meta flex flex-col items-center w-full">
        <div className="status-banner__updated bg-black/15 rounded-full tracking-wide opacity-95">
          Terakhir diperbarui: {formatKeIndonesia(alert?.updatedAt)}
        </div>

        <span className="status-banner__source opacity-75">
          Sumber data resmi: {getDisplaySource(alert?.source)}
        </span>

        {showSystemStatus && (
          <div className="mt-3.5 inline-flex items-center gap-2 rounded-lg border border-white/25 bg-black/20 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white shadow-xs backdrop-blur-xs">
            <span className="relative flex h-2 w-2">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  monitoringMeta.dotColor
                )}
              />
              <span
                className={cn(
                  "relative inline-flex h-2 w-2 rounded-full",
                  monitoringMeta.dotColor
                )}
              />
            </span>
            <span>{monitoringMeta.label}</span>
          </div>
        )}
      </div>
    </section>
  );
};
