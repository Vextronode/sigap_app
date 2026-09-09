import React from "react";
import { ExternalLink } from "lucide-react";
import type { AlertItem } from "../../../../types/alert";
import { AlertSeverityBadge } from "../badges/AlertSeverityBadge";
import { AlertStatusBadge } from "../badges/AlertStatusBadge";
import { formatAlertTimestamp } from "../../utils/alertFormatters";

interface AlertTableRowProps {
  alert: AlertItem;
  index?: number;
  onSelectAlert: (alert: AlertItem) => void;
}

export const AlertTableRow: React.FC<AlertTableRowProps> = ({
  alert,
  index,
  onSelectAlert,
}) => {
  const time = formatAlertTimestamp(alert.createdAt);
  const isPending =
    alert.reviewStatus === "Belum Diverifikasi" ||
    alert.reviewStatus === "Belum Ditinjau";

  return (
    <tr className="hover:bg-[color:var(--surface-muted)]/60 transition-colors border-b border-[color:var(--border)] bg-[color:var(--surface)]">
      {/* Nomor Urut */}
      <td className="py-4 px-3 sm:px-4 text-center font-medium text-xs text-[color:var(--text-muted)] whitespace-nowrap">
        {index ?? "-"}
      </td>

      {/* Timestamp */}
      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
        <div className="font-medium text-[color:var(--text)] text-xs sm:text-sm">
          {time.primary}
        </div>
        <div className="text-[11px] text-[color:var(--text-muted)] mt-0.5">
          {time.relative}
        </div>
      </td>

      {/* Severity */}
      <td className="py-4 px-4 whitespace-nowrap">
        <AlertSeverityBadge level={alert.level} />
      </td>

      {/* Source */}
      <td className="py-4 px-4 whitespace-nowrap font-normal text-sm text-[color:var(--text)]">
        {alert.source}
      </td>

      {/* Description */}
      <td className="py-4 px-4 max-w-md">
        <p
          className="text-xs sm:text-sm font-normal text-[color:var(--text)] line-clamp-2"
          title={alert.description || ""}
        >
          {alert.description || "Tidak ada rincian deskripsi tambahan."}
        </p>
      </td>

      {/* Lokasi Gempa & Shakemap */}
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="text-xs sm:text-sm font-medium text-[color:var(--text)] max-w-xs truncate" title={alert.location || "Wilayah Sekitar Pangandaran"}>
          {alert.location || "Wilayah Sekitar Pangandaran"}
        </div>
        {alert.shakemap ? (
          <a
            href={alert.shakemap}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline mt-1 cursor-pointer transition-colors"
            title="Buka gambar titik gempa & shakemap BMKG di tab baru"
          >
            <span>Lihat Shakemap</span>
            <ExternalLink size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />
          </a>
        ) : (
          <span className="text-[11px] text-[color:var(--text-muted)] italic mt-1 block">
            Peta tidak tersedia
          </span>
        )}
      </td>

      {/* Status */}
      <td className="py-4 px-4 whitespace-nowrap">
        <AlertStatusBadge status={alert.reviewStatus} />
      </td>

      {/* Action */}
      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
        {isPending ? (
          <button
            type="button"
            onClick={() => onSelectAlert(alert)}
            className="px-4 py-1.5 rounded-lg bg-[#00247D] hover:bg-[#001c60] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Tinjau Detail
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectAlert(alert)}
            className="px-4 py-1.5 rounded-lg border border-[color:var(--primary)] text-[color:var(--primary)] hover:bg-[color:var(--surface-muted)] text-xs font-semibold transition-colors cursor-pointer"
          >
            Lihat
          </button>
        )}
      </td>
    </tr>
  );
};
