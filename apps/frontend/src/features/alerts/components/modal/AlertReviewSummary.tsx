import React from "react";
import { Radio, Calendar, Clock, User } from "lucide-react";
import type { AlertItem } from "../../../../types/alert";
import { AlertSeverityBadge } from "../badges/AlertSeverityBadge";
import { formatAlertTimestamp } from "../../utils/alertFormatters";

interface AlertReviewSummaryProps {
  alert: AlertItem;
}

export const AlertReviewSummary: React.FC<AlertReviewSummaryProps> = ({ alert }) => {
  const createdTime = formatAlertTimestamp(alert.createdAt);
  const reviewedTime = alert.reviewedAt ? formatAlertTimestamp(alert.reviewedAt) : null;

  return (
    <div className="space-y-3">
      {/* Alert Card Box */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <AlertSeverityBadge level={alert.level} />

          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Radio size={13} className="text-[#00247D]" />
            Sumber:{" "}
            <strong className="font-semibold text-slate-800">
              {alert.source}
            </strong>
          </span>
        </div>

        <p className="text-sm font-medium text-slate-800 leading-relaxed">
          {alert.description || "Tidak terdapat ringkasan rincian alert."}
        </p>

        <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar size={13} />
            {createdTime.primary}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} />
            Status: <span className="font-semibold text-slate-800">{alert.reviewStatus}</span>
          </span>
        </div>
      </div>

      {/* Info Reviewer Sebelumnya */}
      {alert.reviewedBy && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-xs">
          <User size={16} className="text-[#00247D] mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold text-slate-800">
              Terakhir ditinjau oleh: {alert.reviewer?.name || alert.reviewedBy}
            </p>
            <p className="text-slate-500">
              {alert.reviewer?.email ? `${alert.reviewer.email} • ` : ""}
              {reviewedTime ? reviewedTime.primary : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
