import { AlertTriangle } from "lucide-react";
import { formatWibMoment } from "../../../utils/date";
import { isSchedulerStateHealthy } from "../../../services/systemHealthService";
import { useSystemHealth } from "../hooks/useSystemHealth";

/**
 * Peringatan di dashboard admin saat scheduler alert tidak sehat (TK-04).
 * Gaya mengikuti bar "Data Tidak Tersedia" pada ActiveIncidentBar.
 */
export const SchedulerWarningBar = () => {
  const { data } = useSystemHealth();
  const scheduler = data?.scheduler;

  if (!scheduler || isSchedulerStateHealthy(scheduler.state)) return null;

  const since = scheduler.lastSuccessAt
    ? `sejak ${formatWibMoment(scheduler.lastSuccessAt)}`
    : "sejak backend dimulai";

  const headline =
    scheduler.state === "GAGAL"
      ? `Siklus scheduler alert gagal ${scheduler.consecutiveFailures} kali berturut-turut.`
      : scheduler.state === "TIDAK_AKTIF"
        ? "Scheduler alert tidak aktif."
        : `Scheduler alert terlambat: tidak ada siklus sukses ${since}.`;

  return (
    <div
      className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-slate-400/40 bg-slate-500/10 text-slate-900 dark:text-slate-100 text-xs shadow-2xs"
      role="status"
    >
      <AlertTriangle size={16} className="shrink-0" />
      <p>
        <strong className="font-bold">{headline}</strong> Level dihitung langsung dari BMKG; riwayat
        alert dan notifikasi tertunda.
      </p>
    </div>
  );
};
