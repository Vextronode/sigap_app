import React from "react";
import { Radio, Calendar, Clock, User, ExternalLink, MapPin } from "lucide-react";
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
      <div className="p-4 rounded-xl bg-[color:var(--surface-muted)] border border-[color:var(--border)] space-y-3">
        {/* Gambar Titik Gempa / Shakemap BMKG */}
        {alert.shakemap ? (
          <div className="space-y-1.5">
            <div className="relative overflow-hidden rounded-lg border border-[color:var(--border)] bg-black/5 dark:bg-black/20">
              <img
                src={alert.shakemap}
                alt={`Peta Titik Gempa & Shakemap BMKG - ${alert.location || "Pangandaran"}`}
                className="w-full max-h-56 object-contain mx-auto"
                loading="lazy"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] px-0.5 text-[color:var(--text-muted)]">
              <span>Peta Titik Pusat Gempa & Shakemap BMKG</span>
              <a
                href={alert.shakemap}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                title="Buka gambar shakemap ukuran penuh di tab baru"
              >
                <span>Buka di tab baru</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        ) : (
          <div className="py-2.5 px-3 rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] text-center text-[11px] text-[color:var(--text-muted)]">
            Gambar peta titik gempa (Shakemap) tidak tersedia untuk rekaman ini
          </div>
        )}

        <div className="flex items-center justify-between">
          <AlertSeverityBadge level={alert.level} />

          <span className="text-xs text-[color:var(--text-muted)] flex items-center gap-1.5">
            <Radio size={13} className="text-[color:var(--primary)]" />
            Sumber:{" "}
            <strong className="font-semibold text-[color:var(--text)]">
              {alert.source}
            </strong>
          </span>
        </div>

        {alert.location && (
          <div className="text-xs font-semibold text-[color:var(--text)] flex items-center gap-1.5">
            <MapPin size={13} className="text-rose-500 shrink-0" />
            <span>{alert.location}</span>
          </div>
        )}

        <p className="text-sm font-medium text-[color:var(--text)] leading-relaxed">
          {alert.description || "Tidak terdapat ringkasan rincian alert."}
        </p>

        <div className="pt-2.5 border-t border-[color:var(--border)] flex items-center justify-between text-xs text-[color:var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Calendar size={13} />
            {createdTime.primary}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} />
            Status:{" "}
            <span className="font-semibold text-[color:var(--text)]">
              {alert.reviewStatus}
            </span>
          </span>
        </div>
      </div>

      {/* Info Reviewer Sebelumnya */}
      {alert.reviewedBy && (
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-start gap-3 text-xs">
          <User size={16} className="text-[#00247D] dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              Terakhir ditinjau oleh: {alert.reviewer?.name || alert.reviewedBy}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              {alert.reviewer?.email ? `${alert.reviewer.email} • ` : ""}
              {reviewedTime ? reviewedTime.primary : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
