import React from "react";
import { RefreshCw } from "lucide-react";

interface AlertHeaderProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const AlertHeader: React.FC<AlertHeaderProps> = ({
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Verifikasi & Validasi Alert
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tinjau dan validasi klasifikasi data telemetri serta peringatan resmi untuk arsip desa.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          title="Segarkan data alert"
        >
          <RefreshCw
            size={13}
            className={`text-[#00247D] ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>{isRefreshing ? "Memperbarui..." : "Segarkan"}</span>
        </button>
      </div>
    </div>
  );
};
