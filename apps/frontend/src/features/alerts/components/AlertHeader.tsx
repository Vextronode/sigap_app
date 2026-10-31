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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[color:var(--text)]">
          Verifikasi & Validasi Status Gempa Pangandaran
        </h1>
        <p className="text-xs sm:text-sm text-[color:var(--text-muted)] mt-1 max-w-3xl leading-relaxed">
          Pantau data peringatan gempa BMKG, periksa lokasi titik gempa & peta shakemap, lalu konfirmasi atau tindak lanjuti sebagai arsip resmi kebencanaan Desa Cibenda.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="group inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text)] hover:bg-[color:var(--surface-muted)] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          title="Segarkan data alert"
        >
          <RefreshCw
            size={13}
            className={`text-[color:var(--primary)] transition-transform ${isRefreshing ? "animate-spin" : "group-hover:rotate-45"
              }`}
          />
          <span>{isRefreshing ? "Memperbarui..." : "Segarkan"}</span>
        </button>
      </div>
    </div>
  );
};
