import { useState, useEffect } from "react";
import {
  TriangleAlert,
  RefreshCw,
  Clock,
  User,
  Zap,
} from "lucide-react";
import { GrUserAdmin } from "react-icons/gr";

import { SectionHeader } from "../components/common/SectionHeader";
import { EarthquakeCard } from "../features/dashboard/components/EarthquakeCard";
import { TsunamiCard } from "../features/dashboard/components/TsunamiCard";
import { WeatherSection } from "../features/dashboard/components/WeatherSection";
import { SystemConnectivitySection } from "../features/admin/components/SystemConnectivitySection";
import { AdminKpiMetrics } from "../features/admin/components/AdminKpiMetrics";
import { ActiveIncidentBar } from "../features/admin/components/ActiveIncidentBar";
import { AdminQuickActionsPanel } from "../features/admin/components/AdminQuickActionsPanel";
import { DoubleConfirmationModal } from "../features/admin/components/DoubleConfirmationModal";
import {
  AlertFeedbackBanner,
  type AlertFeedback,
} from "../features/alerts/components/AlertFeedbackBanner";

import { useCurrentAlert } from "../features/dashboard/hooks/useCurrentAlert";
import { usePangandaranEarthquake } from "../features/dashboard/hooks/usePangandaranEarthquake";
import { usePangandaranHistory } from "../features/dashboard/hooks/usePangandaranHistory";
import { useTsunamiStatus } from "../features/dashboard/hooks/useTsunamiStatus";
import { useWeather } from "../features/dashboard/hooks/useWeather";
import { useForecast } from "../features/dashboard/hooks/useForecast";
import { useDeviceStatus } from "../features/dashboard/hooks/useDeviceStatus";
import { usePushSubscribers } from "../features/admin/hooks/usePushSubscribers";
import {
  useAlerts,
  useAlertStats,
  useReviewAlert,
} from "../features/alerts/hooks/useAlertVerification";
import { useAuthStore } from "../stores/authStore";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { AlertItem } from "../types/alert";
import type { CurrentAlert } from "../types/dashboard";
import { cn } from "../utils/cn";

export default function AdminDashboardPage() {
  useDocumentTitle("Command Center - SIGAP Desa Cibenda");

  const { user } = useAuthStore();
  const isOperator = user?.roles?.some((r) => r.toLowerCase().includes("operator")) ?? false;
  const isAdminRole = !isOperator;

  // Real-time queries
  const weatherQuery = useWeather();
  const forecastQuery = useForecast();
  const pangandaranEarthquakeQuery = usePangandaranEarthquake();
  const pangandaranHistoryQuery = usePangandaranHistory();
  const tsunamiQuery = useTsunamiStatus();
  const alertQuery = useCurrentAlert();
  const deviceStatusQuery = useDeviceStatus();
  const alertStatsQuery = useAlertStats();
  const subscribersQuery = usePushSubscribers();
  const latestAlertsQuery = useAlerts({ limit: 1 });

  const reviewMutation = useReviewAlert();

  // State modal konfirmasi ganda & feedback
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<AlertFeedback | null>(null);

  // Digital live clock WIB
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefreshAll = async () => {
    await Promise.all([
      weatherQuery.refetch(),
      forecastQuery.refetch(),
      pangandaranEarthquakeQuery.refetch(),
      pangandaranHistoryQuery.refetch(),
      tsunamiQuery.refetch(),
      alertQuery.refetch(),
      deviceStatusQuery.refetch(),
      alertStatsQuery.refetch(),
      subscribersQuery.refetch(),
      latestAlertsQuery.refetch(),
    ]);
  };

  const isRefreshing = [
    weatherQuery.isFetching,
    forecastQuery.isFetching,
    pangandaranEarthquakeQuery.isFetching,
    tsunamiQuery.isFetching,
    alertQuery.isFetching,
    alertStatsQuery.isFetching,
  ].some(Boolean);

  // Resolve alert aktif yang dapat diverifikasi
  const activeAlertData: AlertItem | CurrentAlert | null =
    (latestAlertsQuery.data?.data?.[0] as AlertItem) || alertQuery.data || null;

  const handleOpenVerifyModal = () => {
    setIsConfirmModalOpen(true);
  };

  const handleCloseVerifyModal = () => {
    setIsConfirmModalOpen(false);
  };

  const handleExecuteReview = async (
    id: string,
    status: "Dikonfirmasi" | "Ditolak" | "Ditindaklanjuti",
    options?: { triggerSiren?: boolean }
  ) => {
    try {
      const targetId =
        id && id !== "current-alert" && id !== "safe-fallback"
          ? id
          : latestAlertsQuery.data?.data?.[0]?.id || alertQuery.data?.id;

      if (!targetId) {
        throw new Error("ID alert tidak ditemukan untuk diproses verifikasi.");
      }

      await reviewMutation.mutateAsync({
        id: targetId,
        payload: { reviewStatus: status },
      });

      let successMsg = `Alert resmi berhasil diklasifikasikan sebagai "${status}". Tercatat atas nama ${user?.name || "Operator"}.`;
      if (options?.triggerSiren) {
        successMsg += " Perintah aktivasi Sirine Menara (Alat 2) berhasil dikirimkan via ESP-NOW.";
      }

      setFeedback({
        type: "success",
        message: successMsg,
      });

      // Refetch untuk memastikan tampilan tersinkronisasi instan
      await Promise.all([alertQuery.refetch(), alertStatsQuery.refetch(), latestAlertsQuery.refetch()]);

      setTimeout(() => {
        setFeedback(null);
      }, 7000);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Gagal menyimpan verifikasi alert resmi.",
      });
    }
  };

  const formattedTimeWib = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDateWib = currentTime.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. Header Command Center Operasional */}
      <header className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Posko Bencana Standby
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
              <span className="text-[10px] sm:text-[11px] font-mono font-medium text-[color:var(--text-muted)]">
                Desa Cibenda, Kab. Pangandaran
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-[color:var(--text)] mt-1">
              Command Center SIGAP
            </h1>
            <p className="text-xs sm:text-sm text-[color:var(--text-muted)] mt-0.5">
              Pusat Kendali Operasional Kebencanaan, Telemetri Gempa & Validasi Siaga Desa
            </p>
          </div>

          {/* Jam Digital WIB, Profil Operator & Tombol Segarkan */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            {/* Jam Digital */}
            <div className="flex items-center justify-between sm:justify-start gap-2.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-[color:var(--primary)] shrink-0" />
                <span className="text-xs font-mono font-black tracking-wide text-[color:var(--text)]">
                  {formattedTimeWib} <span className="text-[10px] font-normal text-[color:var(--text-muted)]">WIB</span>
                </span>
              </div>
              <span className="text-[10px] text-[color:var(--text-muted)] font-medium">
                {formattedDateWib}
              </span>
            </div>

            {/* Operator Chip & Tombol Sinkronisasi */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex-1 sm:flex-initial flex items-center gap-2.5 rounded-xl border px-3 py-1.5 sm:py-2 shadow-2xs transition-colors min-w-0",
                  isAdminRole
                    ? "border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/20"
                    : "border-blue-500/30 bg-blue-500/10 dark:bg-blue-950/20"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg border shrink-0",
                    isAdminRole
                      ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30"
                      : "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30"
                  )}
                >
                  {isAdminRole ? <GrUserAdmin className="w-3.5 h-3.5" /> : <User size={15} />}
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="text-xs font-bold text-[color:var(--text)] truncate max-w-[120px] sm:max-w-[140px]">
                    {user?.name || user?.email || (isAdminRole ? "Administrator" : "Operator Posko")}
                  </p>
                  <span
                    className={cn(
                      "inline-block text-[9px] font-extrabold uppercase tracking-wider leading-none",
                      isAdminRole
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-blue-600 dark:text-blue-400"
                    )}
                  >
                    {isAdminRole ? "Administrator" : "Operator Posko"}
                  </span>
                </div>
              </div>

              {/* Tombol Segarkan Sistem */}
              <button
                type="button"
                onClick={handleRefreshAll}
                disabled={isRefreshing}
                className="flex h-10 w-10 sm:h-auto sm:w-auto sm:px-3 sm:py-2 items-center justify-center gap-1.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-xs font-bold text-[color:var(--text)] shadow-2xs hover:bg-[color:var(--surface-muted)] transition-all cursor-pointer shrink-0 disabled:opacity-50"
                title="Segarkan seluruh data BMKG, IoT, dan Verifikasi"
              >
                <RefreshCw
                  size={14}
                  className={isRefreshing ? "animate-spin text-[color:var(--primary)]" : "text-[color:var(--primary)]"}
                />
                <span className="hidden sm:inline">Sinkronisasi</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Banner Notifikasi Feedback */}
      <AlertFeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} />

      {/* 3. Active Incident Action Bar (Kondisional: muncul saat ada insiden aktif atau status belum diverifikasi) */}
      <ActiveIncidentBar
        alert={alertQuery.data ?? null}
        earthquake={pangandaranEarthquakeQuery.data ?? null}
        onOpenVerify={handleOpenVerifyModal}
      />

      {/* 4. 4 KPI Metrics Cards Command Center */}
      <AdminKpiMetrics
        alert={alertQuery.data ?? null}
        subscriberCount={subscribersQuery.data ?? 0}
        deviceStatus={deviceStatusQuery.data ?? null}
        alertStats={alertStatsQuery.data ?? null}
        isLoading={alertQuery.isLoading && subscribersQuery.isLoading}
      />

      {/* 5. Main Command Center Workspace (2 Kolom Desktop: 7 col kiri / 5 col kanan) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Kolom Kiri: Pemantauan Visual Telemetri (Col-span 7) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Monitoring Gempa Bumi & Shakemap */}
          <section aria-labelledby="earthquake-command">
            <SectionHeader
              id="earthquake-command"
              title="Monitoring Gempa Pangandaran & Shakemap"
              icon={<TriangleAlert size={20} />}
            />
            <div className="mt-2 space-y-4">
              <EarthquakeCard
                title="Info Gempa Pangandaran"
                earthquake={pangandaranEarthquakeQuery.data ?? null}
                isLoading={pangandaranEarthquakeQuery.isLoading}
                isError={pangandaranEarthquakeQuery.isError}
                historicalEarthquake={pangandaranHistoryQuery.data ?? null}
                showSourceLink={true}
              />

              <TsunamiCard
                tsunami={tsunamiQuery.data ?? null}
                isLoading={tsunamiQuery.isLoading}
                isError={tsunamiQuery.isError}
              />
            </div>
          </section>

          {/* Monitor Konektivitas Sistem */}
          <SystemConnectivitySection />
        </div>

        {/* Kolom Kanan: Panel Kendali Cepat Operator & Cuaca Desa (Col-span 5) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Panel Akses Cepat Admin */}
          <section aria-labelledby="command-panel">
            <SectionHeader
              id="command-panel"
              title="Pintasan Cepat Admin"
              icon={<Zap size={20} />}
            />
            <div className="mt-2">
              <AdminQuickActionsPanel
                alert={alertQuery.data ?? null}
                pendingCount={alertStatsQuery.data?.pending ?? 0}
                onOpenVerify={handleOpenVerifyModal}
                onTriggerSiren={handleOpenVerifyModal}
              />
            </div>
          </section>

          {/* Kondisi Cuaca Balai Desa Cibenda & Prakiraan Cuaca 5 Hari */}
          <WeatherSection
            weather={weatherQuery.data ?? null}
            forecast={forecastQuery.data ?? []}
            isWeatherLoading={weatherQuery.isLoading}
            isWeatherError={weatherQuery.isError}
            isForecastLoading={forecastQuery.isLoading}
            isForecastError={forecastQuery.isError}
            showForecast={true}
            showSourceLink={true}
          />
        </div>
      </div>

      {/* 6. Modal Konfirmasi Ganda Verifikasi Gempa & Trigger Sirine */}
      <DoubleConfirmationModal
        isOpen={isConfirmModalOpen}
        alert={activeAlertData}
        earthquake={pangandaranEarthquakeQuery.data ?? null}
        onClose={handleCloseVerifyModal}
        onSubmit={handleExecuteReview}
        isSubmitting={reviewMutation.isPending}
      />
    </div>
  );
}
