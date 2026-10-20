import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  ShieldCheck,
  Bell,
  ChevronRight,
  CheckCircle2,
  Clock,
  Radio,
} from "lucide-react";
import { BiBarChartAlt } from "react-icons/bi";
import { LuSiren } from "react-icons/lu";
import { Card } from "../../../components/ui/Card";
import { Skeleton } from "../../../components/ui/Skeleton";
import type { CurrentAlert } from "../../../types/dashboard";
import type { DeviceSystemStatus } from "../../../services/deviceService";
import type { AlertStatsSummary } from "../../../types/alert";
import { cn } from "../../../utils/cn";

interface AdminKpiMetricsProps {
  alert: CurrentAlert | null;
  subscriberCount?: number;
  deviceStatus?: DeviceSystemStatus | null;
  alertStats?: AlertStatsSummary | null;
  isLoading?: boolean;
}

export const AdminKpiMetrics: React.FC<AdminKpiMetricsProps> = ({
  alert,
  subscriberCount = 0,
  deviceStatus,
  alertStats,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-3 sm:p-4.5 border border-[color:var(--border)] bg-[color:var(--surface)] rounded-2xl">
            <Skeleton className="h-3 w-20 sm:w-28 mb-2 sm:mb-3" />
            <Skeleton className="h-6 sm:h-8 w-14 sm:w-20 mb-2" />
            <Skeleton className="h-2.5 w-24 sm:w-36" />
          </Card>
        ))}
      </div>
    );
  }

  // 1. Status Siaga Desa
  const alertLevel = alert?.level || "GREEN";
  const isEmergency = alertLevel === "ORANGE" || alertLevel === "RED";
  const isWarning = alertLevel === "YELLOW";

  const levelConfig = {
    GREEN: {
      label: "SIAGA 4 - AMAN",
      shortLabel: "SIAGA 4",
      badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      dotClass: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
      desc: "Wilayah kondusif & normal",
      icon: ShieldCheck,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    YELLOW: {
      label: "SIAGA 3 - WASPADA",
      shortLabel: "SIAGA 3",
      badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
      dotClass: "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]",
      desc: "Peningkatan aktivitas seismik",
      icon: ShieldAlert,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    ORANGE: {
      label: "SIAGA 2 - SIAGA",
      shortLabel: "SIAGA 2",
      badgeClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
      dotClass: "bg-orange-500 animate-ping",
      desc: "Potensi bahaya tinggi. Siaga.",
      icon: ShieldAlert,
      iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    },
    RED: {
      label: "SIAGA 1 - AWAS",
      shortLabel: "SIAGA 1",
      badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
      dotClass: "bg-rose-500 animate-ping",
      desc: "Kedaruratan aktif!",
      icon: ShieldAlert,
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
  }[alertLevel];

  const LevelIcon = levelConfig.icon;

  // 2. Metrik Subscriber Web Push
  const totalSubscribers = subscriberCount;

  // 3. Metrik Antrean Verifikasi
  const pendingCount = alertStats?.pending ?? 0;

  // 4. Metrik IoT Perangkat
  const isIotOnline = deviceStatus?.status === "ONLINE";

  return (
    <div
      className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4"
      role="region"
      aria-label="Metrik Operasional Utama"
    >
      {/* Kartu 1: Status Kesiapsiagaan Desa */}
      <Card
        className={cn(
          "relative overflow-hidden flex flex-col justify-between p-3 sm:p-4.5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          isEmergency
            ? "border-rose-500/40 bg-gradient-to-b from-rose-500/10 via-[color:var(--surface)] to-[color:var(--surface)]"
            : isWarning
              ? "border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-[color:var(--surface)] to-[color:var(--surface)]"
              : "border-[color:var(--border)] bg-[color:var(--surface)] hover:border-emerald-500/40"
        )}
      >
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[color:var(--text-muted)] truncate">
            Kesiapsiagaan
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <span className={cn("h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full", levelConfig.dotClass)} />
            <span className="text-[9px] sm:text-[10px] font-semibold text-[color:var(--text-muted)] font-mono">
              Live
            </span>
          </div>
        </div>

        <div className="my-2 sm:my-2.5 flex items-center gap-2 sm:gap-3">
          <div className={cn("flex h-8 w-8 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border shadow-2xs", levelConfig.iconBg)}>
            <LevelIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black border tracking-wider",
                levelConfig.badgeClass
              )}
            >
              {levelConfig.label}
            </span>
            <p className="mt-1 text-[10px] sm:text-xs text-[color:var(--text-muted)] font-medium truncate">
              {levelConfig.desc}
            </p>
          </div>
        </div>

        <div className="pt-2 sm:pt-2.5 border-t border-[color:var(--border)] flex items-center justify-between text-[10px] sm:text-[11px] text-[color:var(--text-muted)]">
          <span className="truncate">Sumber: BMKG</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-1">
            {alert?.reviewStatus || "Terverifikasi"}
          </span>
        </div>
      </Card>

      {/* Kartu 2: Warga Penerima Web Push Aktif */}
      <Card className="relative overflow-hidden flex flex-col justify-between p-3 sm:p-4.5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-500/40">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[color:var(--text-muted)] truncate">
            Web Push Aktif
          </span>
          <span className="inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
            <Radio size={8} className="animate-pulse" />
            VAPID
          </span>
        </div>

        <div className="my-2 sm:my-2.5 flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-2xs">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-black tracking-tight text-[color:var(--text)]">
                {totalSubscribers}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-[color:var(--text-muted)] truncate">
                Warga Terhubung
              </span>
            </div>
            <p className="mt-0.5 text-[10px] sm:text-xs text-[color:var(--text-muted)] font-medium truncate">
              Menerima broadcast HP
            </p>
          </div>
        </div>

        <div className="pt-2 sm:pt-2.5 border-t border-[color:var(--border)] flex items-center justify-between text-[10px] sm:text-[11px] text-[color:var(--text-muted)]">
          <span className="truncate">Jalur Cepat</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400 shrink-0 ml-1">Siap Kirim</span>
        </div>
      </Card>

      {/* Kartu 3: Antrean Verifikasi Alert */}
      <Card
        className={cn(
          "relative overflow-hidden flex flex-col justify-between p-3 sm:p-4.5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          pendingCount > 0
            ? "border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-[color:var(--surface)] to-[color:var(--surface)]"
            : "border-[color:var(--border)] bg-[color:var(--surface)] hover:border-emerald-500/40"
        )}
      >
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[color:var(--text-muted)] truncate">
            Verifikasi Gempa
          </span>
          {pendingCount > 0 ? (
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-amber-500" />
            </span>
          ) : (
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
          )}
        </div>

        <div className="my-2 sm:my-2.5 flex items-center gap-2 sm:gap-3">
          <div
            className={cn(
              "flex h-8 w-8 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border shadow-2xs",
              pendingCount > 0
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            )}
          >
            <BiBarChartAlt className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-lg sm:text-2xl font-black tracking-tight",
                  pendingCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-[color:var(--text)]"
                )}
              >
                {pendingCount}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-[color:var(--text-muted)]">
                Antrean
              </span>
            </div>
            <p className="mt-0.5 text-[10px] sm:text-xs text-[color:var(--text-muted)] font-medium truncate">
              {pendingCount > 0 ? "Perlu validasi" : "Semua tervalidasi"}
            </p>
          </div>
        </div>

        <div className="pt-2 sm:pt-2.5 border-t border-[color:var(--border)] flex items-center justify-between text-[10px] sm:text-[11px] text-[color:var(--text-muted)]">
          <span className="flex items-center gap-0.5 truncate">
            <Clock size={10} className="shrink-0" />
            <span>{alertStats?.total ?? 0} tercatat</span>
          </span>
          <Link
            to="/admin/alerts"
            className="inline-flex items-center gap-0.5 font-bold text-[color:var(--primary)] hover:underline shrink-0 ml-1"
          >
            <span>Tabel Log</span>
            <ChevronRight size={11} />
          </Link>
        </div>
      </Card>

      {/* Kartu 4: Alat IoT Posko & Sirine */}
      <Card className="relative overflow-hidden flex flex-col justify-between p-3 sm:p-4.5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-purple-500/40">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[color:var(--text-muted)] truncate">
            IoT & Sirine
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold border shrink-0",
              isIotOnline
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700"
            )}
          >
            <span className={cn("h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full", isIotOnline ? "bg-emerald-500" : "bg-slate-400")} />
            {isIotOnline ? "Online" : "Standby"}
          </span>
        </div>

        <div className="my-2 sm:my-2.5 flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-2xs">
            <LuSiren className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-black tracking-tight text-[color:var(--text)] truncate">
              Unit Posko
            </p>
            <p className="mt-0.5 text-[10px] sm:text-xs text-[color:var(--text-muted)] font-medium truncate">
              {isIotOnline ? "ESP-NOW Radio Online" : "Jalur Radio Standby"}
            </p>
          </div>
        </div>

        <div className="pt-2 sm:pt-2.5 border-t border-[color:var(--border)] flex items-center justify-between text-[10px] sm:text-[11px] text-[color:var(--text-muted)]">
          <span className="truncate">Menara</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-1">Siap Picu</span>
        </div>
      </Card>
    </div>
  );
};
