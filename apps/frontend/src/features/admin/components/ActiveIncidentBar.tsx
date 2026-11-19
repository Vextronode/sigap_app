import React from "react";
import {
  AlertTriangle,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Waves,
} from "lucide-react";
import type { CurrentAlert, Earthquake } from "../../../types/dashboard";
import { cn } from "../../../utils/cn";
import { getSequenceSummary } from "../../../utils/alertSequence";
import { formatTime } from "../../../utils/date";

interface ActiveIncidentBarProps {
  alert: CurrentAlert | null;
  earthquake: Earthquake | null;
}

export const ActiveIncidentBar: React.FC<ActiveIncidentBarProps> = ({
  alert,
  earthquake,
}) => {
  if (!alert) return null;

  const alertLevel = alert.level;
  const isEmergency = alertLevel === "ORANGE" || alertLevel === "RED";
  const isWarning = alertLevel === "YELLOW";

  // Data tidak tersedia: jangan menyatakan kondisi aman
  if (alertLevel === "UNKNOWN") {
    return (
      <div
        className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-slate-400/40 bg-slate-500/10 text-slate-900 dark:text-slate-100 text-xs shadow-2xs"
        role="status"
      >
        <AlertTriangle size={16} className="shrink-0" />
        <p>
          <strong className="font-bold">Data Tidak Tersedia:</strong> {alert.description}
        </p>
      </div>
    );
  }

  // Jika kondisi aman, tampilkan banner posko kondusif yang tenang
  if (!isEmergency && !isWarning) {
    return (
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 text-xs shadow-2xs"
        role="status"
        aria-label="Status kesiapsiagaan kondusif"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={16} />
          </div>
          <p className="truncate">
            <strong className="font-bold">Posko Standby:</strong> Tidak terdapat peringatan aktif untuk Desa Cibenda.
          </p>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Kondisi Normal
        </span>
      </div>
    );
  }

  // Jika ada insiden aktif
  const sequenceSummary = getSequenceSummary(alert);
  const toneClass = isEmergency
    ? "border-rose-500/50 bg-rose-500/10 text-rose-950 dark:text-rose-100"
    : "border-amber-500/50 bg-amber-500/10 text-amber-950 dark:text-amber-100";

  const pulseDot = isEmergency
    ? "bg-rose-500 animate-ping"
    : "bg-amber-500 animate-pulse";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 sm:p-4.5 shadow-xs transition-all",
        toneClass
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Info Insiden */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/90 dark:bg-black/40 shadow-2xs border border-current/20">
            <span className={cn("absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full", pulseDot)} />
            {isEmergency ? (
              <ShieldAlert size={18} className="text-rose-600 dark:text-rose-400" />
            ) : (
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase border",
                  isEmergency
                    ? "bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/30"
                    : "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30"
                )}
              >
                Peringatan Insiden: Level {alertLevel}
              </span>

              {alert.updatedAt && (
                <span className="text-[11px] opacity-80 font-mono">
                  {formatTime(alert.updatedAt)} WIB
                </span>
              )}
            </div>

            {/* Pada rentetan, gempa terakhir di kartu belum tentu gempa penentu level,
                sehingga judul memakai deskripsi alert (gempa terbesar pada level itu). */}
            <h3 className="text-xs sm:text-sm font-extrabold tracking-tight line-clamp-2 sm:line-clamp-1">
              {earthquake && !sequenceSummary
                ? `Gempa M ${earthquake.magnitude} — ${earthquake.distanceToVillage} km dari Balai Desa Cibenda`
                : alert.description || "Peringatan Dini Bencana Gempa Pangandaran"}
            </h3>

            {alert.location && (
              <p className="flex items-center gap-1.5 text-[11px] sm:text-xs opacity-90 truncate font-medium">
                <MapPin size={11} className="shrink-0 text-rose-500" />
                <span>{alert.location}</span>
              </p>
            )}

            {sequenceSummary && (
              <p className="flex items-start gap-1.5 text-[11px] sm:text-xs opacity-90 font-medium">
                <Waves size={11} className="shrink-0 mt-0.5" />
                <span>{sequenceSummary}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
