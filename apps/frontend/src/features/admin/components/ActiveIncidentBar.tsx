import React from "react";
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import type { CurrentAlert, Earthquake } from "../../../types/dashboard";
import { cn } from "../../../utils/cn";

interface ActiveIncidentBarProps {
  alert: CurrentAlert | null;
  earthquake: Earthquake | null;
  onOpenVerify: () => void;
}

export const ActiveIncidentBar: React.FC<ActiveIncidentBarProps> = ({
  alert,
  earthquake,
  onOpenVerify,
}) => {
  const alertLevel = alert?.level || "GREEN";
  const reviewStatus = alert?.reviewStatus || "Belum Diverifikasi";
  const isPendingReview =
    reviewStatus === "Belum Diverifikasi" || reviewStatus === "Belum Ditinjau";

  const isEmergency = alertLevel === "ORANGE" || alertLevel === "RED";
  const isWarning = alertLevel === "YELLOW";

  // Jika kondisi aman dan tidak ada review tertunda, tampilkan banner posko kondusif yang tenang
  if (!isEmergency && !isWarning && !isPendingReview) {
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
            <strong className="font-bold">Posko Standby:</strong> Tidak terdapat peringatan gempa Pangandaran yang menunggu verifikasi staf. Seluruh data tervalidasi.
          </p>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Kondisi Normal
        </span>
      </div>
    );
  }

  // Jika ada insiden aktif atau menunggu verifikasi staf
  const toneClass = isEmergency
    ? "border-rose-500/50 bg-rose-500/10 text-rose-950 dark:text-rose-100"
    : isWarning
      ? "border-amber-500/50 bg-amber-500/10 text-amber-950 dark:text-amber-100"
      : "border-emerald-500/35 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100";

  const pulseDot = isEmergency
    ? "bg-rose-500 animate-ping"
    : isWarning
      ? "bg-amber-500 animate-pulse"
      : "bg-emerald-500";

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
            ) : isWarning ? (
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
            ) : (
              <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase border",
                  isEmergency
                    ? "bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/30"
                    : isWarning
                      ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                )}
              >
                Peringatan Insiden: Level {alertLevel}
              </span>

              {isPendingReview && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30">
                  <Clock size={10} />
                  Belum Diverifikasi Operator
                </span>
              )}

              {alert?.updatedAt && (
                <span className="text-[11px] opacity-80 font-mono">
                  {new Date(alert.updatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                </span>
              )}
            </div>

            <h3 className="text-xs sm:text-sm font-extrabold tracking-tight line-clamp-2 sm:line-clamp-1">
              {earthquake
                ? `Gempa M ${earthquake.magnitude} — ${earthquake.distanceToVillage} km dari Balai Desa Cibenda`
                : alert?.description || "Peringatan Dini Bencana Gempa Pangandaran"}
            </h3>

            {alert?.location && (
              <p className="flex items-center gap-1.5 text-[11px] sm:text-xs opacity-90 truncate font-medium">
                <MapPin size={11} className="shrink-0 text-rose-500" />
                <span>{alert.location}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 shrink-0 pt-2.5 lg:pt-0 border-t lg:border-t-0 border-current/15">
          <button
            type="button"
            onClick={onOpenVerify}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600/90 dark:hover:bg-blue-600 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Buka dialog verifikasi resmi untuk alert ini"
          >
            <ShieldCheck size={14} />
            <span>Verifikasi & Tindak Lanjut</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
