import React from "react";
import type { AlertItem } from "../../../../types/alert";
import { AlertSeverityBadge } from "../badges/AlertSeverityBadge";
import { AlertStatusBadge } from "../badges/AlertStatusBadge";
import { formatAlertTimestamp } from "../../utils/alertFormatters";

interface AlertTableRowProps {
  alert: AlertItem;
  onSelectAlert: (alert: AlertItem) => void;
}

export const AlertTableRow: React.FC<AlertTableRowProps> = ({
  alert,
  onSelectAlert,
}) => {
  const time = formatAlertTimestamp(alert.createdAt);
  const isPending = alert.reviewStatus === "Belum Ditinjau";

  return (
    <tr className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 bg-white">
      {/* Timestamp */}
      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
        <div className="font-medium text-slate-900 text-xs sm:text-sm">
          {time.primary}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          {time.relative}
        </div>
      </td>

      {/* Severity */}
      <td className="py-4 px-4 whitespace-nowrap">
        <AlertSeverityBadge level={alert.level} />
      </td>

      {/* Source */}
      <td className="py-4 px-4 whitespace-nowrap font-normal text-sm text-slate-700">
        {alert.source}
      </td>

      {/* Description */}
      <td className="py-4 px-4 max-w-md">
        <p
          className="text-xs sm:text-sm font-normal text-slate-800 line-clamp-2"
          title={alert.description || ""}
        >
          {alert.description || "Tidak ada rincian deskripsi tambahan."}
        </p>
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
            className="px-4 py-1.5 rounded-lg border border-[#00247D] text-[#00247D] hover:bg-blue-50/60 text-xs font-semibold transition-colors cursor-pointer"
          >
            Lihat
          </button>
        )}
      </td>
    </tr>
  );
};
