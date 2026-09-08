import React from "react";
import { Check, X, AlertTriangle } from "lucide-react";
import type { AlertReviewStatus } from "../../../../types/alert";

interface AlertStatusBadgeProps {
  status: AlertReviewStatus | string;
  className?: string;
}

export const AlertStatusBadge: React.FC<AlertStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  switch (status) {
    case "Dikonfirmasi":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 ${className}`}
        >
          <Check size={12} strokeWidth={2.5} className="shrink-0" />
          <span>Dikonfirmasi</span>
        </span>
      );

    case "Ditolak":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-700 ${className}`}
        >
          <X size={12} strokeWidth={2.5} className="shrink-0" />
          <span>Ditolak</span>
        </span>
      );

    case "Ditindaklanjuti":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 ${className}`}
        >
          <AlertTriangle size={12} className="shrink-0" />
          <span>Ditindaklanjuti</span>
        </span>
      );

    case "Belum Ditinjau":
    default:
      return (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-700 ${className}`}
        >
          Belum Ditinjau
        </span>
      );
  }
};
