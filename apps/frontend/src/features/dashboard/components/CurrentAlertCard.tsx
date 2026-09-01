import { AlertOctagon, AlertTriangle, ShieldAlert } from "lucide-react";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import type { CurrentAlert } from "../../../types/dashboard";
import { getAlertMeta } from "../../../utils/status";

type CurrentAlertCardProps = {
  alert: CurrentAlert | null;
  isLoading?: boolean;
  isError?: boolean;
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

export const CurrentAlertCard = ({ alert, isLoading = false, isError = false }: CurrentAlertCardProps) => {
  if (isLoading) {
    return (
      <section
        className="card flex flex-col items-center gap-4 px-6 py-10 text-center"
        aria-label="Memuat status kesiapsiagaan"
      >
        <Skeleton className="h-[76px] w-[76px] !rounded-full" />
        <Skeleton className="h-9 w-40 !rounded-lg" />
        <Skeleton className="h-4 w-72 !rounded-lg" />
      </section>
    );
  }

  if (isError) {
    return (
      <StateMessage
        type="error"
        title="Status kesiapsiagaan gagal dimuat"
        message="Status resmi belum dapat diambil. Bagian dashboard lain tetap tersedia."
      />
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
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm">
            <div className="w-3 h-5 border-r-[3.5px] border-b-[3.5px] border-emerald-500 rotate-45 translate-y-[-2px]" />
          </div>
        );
      case "warning":
        return <AlertOctagon size={46} strokeWidth={2.2} className="text-white" aria-hidden="true" />;
      case "orange":
        return <ShieldAlert size={46} strokeWidth={2.2} className="text-white" aria-hidden="true" />;
      case "danger":
      default:
        return <AlertTriangle size={46} strokeWidth={2.2} className="text-white" aria-hidden="true" />;
    }
  };

  return (
    <section className={`status-banner status-banner--${meta.tone}`} aria-labelledby="status-title">
      <div className="status-banner__icon">
        <div className="status-banner__icon-bg relative">
          <div className="absolute inset-0 rounded-full bg-current opacity-70 animate-[ping_2s_infinite]" aria-hidden="true" />
          {renderStatusIcon()}
        </div>
      </div>

      <h1 id="status-title" className="text-4xl font-extrabold -mt-1 mb-1 tracking-wide uppercase text-white">
        {meta.label}
      </h1>

      <p className="text-[15px] font-medium max-w-xl text-white mb-5 leading-relaxed">
        {alert?.description ?? meta.description}
      </p>

      <div className="status-banner__meta flex flex-col items-center w-full">
        <div className="bg-black/15 px-5 py-1.5 rounded-full text-[13px] font-medium tracking-wide opacity-95">
          Terakhir diperbarui: {formatKeIndonesia(alert?.updatedAt)}
        </div>

        <span className="text-xs opacity-75 mt-1">
          Sumber data resmi: {alert?.source ?? "BMKG"}
        </span>
      </div>
    </section>
  );
};
