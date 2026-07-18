import { ShieldAlert } from "lucide-react";
import { Skeleton } from "../../../components/ui/Skeleton";
import type { CurrentAlert } from "../../../types/dashboard";
import { getAlertMeta } from "../../../utils/status";
import { dummyCurrentAlert } from "../data/dummyData";

type CurrentAlertCardProps = {
  alert: CurrentAlert | null;
  isLoading?: boolean;
  isError?: boolean;
};

const formatKeIndonesia = (dateString?: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);

  const opsi: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const terformat = new Intl.DateTimeFormat("id-ID", opsi).format(date);
  return terformat.replace(" pukul ", " - ").replace(":", ".") + " WIB";
};

export const CurrentAlertCard = ({ alert, isLoading = false, isError = false }: CurrentAlertCardProps) => {
  if (isLoading) {
    return (
      <section className="status-banner status-banner--safe" aria-label="Memuat status kesiapsiagaan">
        <Skeleton className="status-banner__icon" />
        <Skeleton className="skeleton--title" />
        <Skeleton className="skeleton--line skeleton--short" />
      </section>
    );
  }

  const displayAlert = alert && !isError ? alert : dummyCurrentAlert;
  const meta = getAlertMeta(displayAlert);
  const isSafe = meta.tone === "safe";

  return (
    <section className={`status-banner status-banner--${meta.tone}`} aria-labelledby="status-title">
      <div className="status-banner__icon">
        <div className="status-banner__icon-bg relative">
          <div className="absolute inset-0 rounded-full bg-current opacity-70 animate-[ping_2s_infinite]" aria-hidden="true" />
          {isSafe ? (
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm">
              <div className="w-3 h-5 border-r-[3.5px] border-b-[3.5px] border-emerald-500 rotate-45 translate-y-[-2px]" />
            </div>
          ) : (
            <ShieldAlert size={46} className="text-white" aria-hidden="true" />
          )}
        </div>
      </div>

      <h1 id="status-title" className="text-4xl font-extrabold -mt-1 mb-1 tracking-wide uppercase">
        {meta.label}
      </h1>

      <p className="text-[15px] font-normal max-w-xl opacity-90 mb-5 leading-relaxed">
        {displayAlert.description ?? meta.description}
      </p>

      <div className="status-banner__meta flex flex-col items-center w-full">
        <div className="bg-black/15 px-5 py-1.5 rounded-full text-[13px] font-medium tracking-wide opacity-95">
          Terakhir diperbarui: {formatKeIndonesia(displayAlert.updatedAt)}
        </div>

        <span className="text-xs opacity-75 mt-1">Sumber data resmi: {displayAlert.source ?? "BMKG"}</span>
      </div>
    </section>
  );
};
