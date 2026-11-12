import { Bell, Clock, RefreshCw, type LucideIcon } from "lucide-react";
import { TbHeartRateMonitor } from "react-icons/tb";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { cn } from "../../../utils/cn";
import { formatWibMoment } from "../../../utils/date";
import { isSchedulerStateHealthy } from "../../../services/systemHealthService";
import { useSystemHealth } from "../hooks/useSystemHealth";

type CardTone = "ok" | "bad" | "checking";

type ConnectivityCard = {
  name: string;
  provider: string;
  logo?: string;
  icon?: LucideIcon;
  tone: CardTone;
  statusText: string;
  message: string;
  footerLabel: string;
  footerValue: string;
};

const BADGE_CLASSES: Record<CardTone, string> = {
  ok: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  bad: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  checking: "border-slate-400/20 bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

const SCHEDULER_LABEL = {
  AKTIF: "AKTIF",
  MEMULAI: "MEMULAI",
  TERLAMBAT: "TERLAMBAT",
  GAGAL: "GAGAL",
  TIDAK_AKTIF: "TIDAK AKTIF",
} as const;

/** Latensi yang tidak diukur ditampilkan "-", bukan angka bawaan. */
const formatLatency = (values: (number | null | undefined)[]) => {
  const measured = values.filter((value): value is number => typeof value === "number");
  return measured.length > 0
    ? `${Math.round(measured.reduce((sum, value) => sum + value, 0) / measured.length)} ms`
    : "-";
};

export const SystemConnectivitySection = () => {
  const { data, refetch, isFetching } = useSystemHealth();

  // Menyatukan data cuaca & gempa menjadi 1 kartu "Data BMKG", dan 1 kartu "Notifikasi Real-Time"
  const weatherService = data?.services?.find((s) => s.category === "weather");
  const earthquakeService = data?.services?.find((s) => s.category === "earthquake");
  const pushService = data?.services?.find((s) => s.category === "push");
  const schedulerService = data?.services?.find((s) => s.category === "scheduler");
  const scheduler = data?.scheduler;

  // Status dari respons backend; selama data belum termuat tidak dianggap terhubung.
  const isBmkgOnline =
    earthquakeService?.status === "ONLINE" && weatherService?.status !== "OFFLINE";
  const isPushOnline = pushService?.status !== "OFFLINE";

  const connectivityCards: ConnectivityCard[] = [
    {
      name: "Data BMKG",
      provider: "Data Gempa & Cuaca BMKG dan API Open-Meteo",
      logo: "/assets/image/logo-bmkg.webp",
      tone: !data ? "checking" : isBmkgOnline ? "ok" : "bad",
      statusText: !data ? "MEMERIKSA" : isBmkgOnline ? "TERHUBUNG" : "TERPUTUS",
      message: !data
        ? "Memeriksa koneksi ke BMKG dan Open-Meteo."
        : isBmkgOnline
          ? "Pembaruan data cuaca per jam dan pemantauan gempa bumi terkini aktif tersinkronisasi."
          : earthquakeService?.status !== "ONLINE"
            ? earthquakeService?.message ?? ""
            : weatherService?.message ?? "",
      footerLabel: "Latensi",
      footerValue: formatLatency([weatherService?.latencyMs, earthquakeService?.latencyMs]),
    },
    {
      name: "Notifikasi Real-Time",
      provider: "Layanan Pengiriman Peringatan Dini Warga",
      icon: Bell,
      tone: !data ? "checking" : isPushOnline ? "ok" : "bad",
      statusText: !data ? "MEMERIKSA" : isPushOnline ? "TERHUBUNG" : "TERPUTUS",
      message: !data
        ? "Memeriksa layanan notifikasi."
        : isPushOnline
          ? "Sistem notifikasi darurat aktif dan siap mengirimkan pesan peringatan langsung ke handphone warga."
          : "Layanan push notification sedang offline atau konfigurasi VAPID belum lengkap.",
      footerLabel: "Latensi",
      footerValue: formatLatency([pushService?.latencyMs]),
    },
    {
      name: "Scheduler Alert",
      provider: "Evaluasi Alert BMKG",
      icon: Clock,
      tone: !scheduler ? "checking" : isSchedulerStateHealthy(scheduler.state) ? "ok" : "bad",
      statusText: !scheduler ? "MEMERIKSA" : SCHEDULER_LABEL[scheduler.state],
      message: schedulerService?.message ?? "Memeriksa status scheduler.",
      footerLabel: "Siklus terakhir",
      footerValue: scheduler?.lastSuccessAt ? formatWibMoment(scheduler.lastSuccessAt) : "-",
    },
  ];

  return (
    <section aria-labelledby="system-connectivity" className="mb-6">
      <SectionHeader
        id="system-connectivity"
        title="Monitor Konektivitas Sistem"
        icon={<TbHeartRateMonitor size={24} />}
        action={
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="group inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text)] shadow-xs transition-colors hover:bg-[color:var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-50"
            title="Segarkan status koneksi"
          >
            <RefreshCw
              size={14}
              className={`text-[color:var(--primary)] transition-transform ${
                isFetching ? "animate-spin" : "group-hover:rotate-45"
              }`}
              aria-hidden="true"
            />
            <span>Segarkan</span>
          </button>
        }
      />

      <div className="dashboard-grid dashboard-grid--three">
        {connectivityCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card
              key={card.name}
              className="flex flex-col justify-between border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--icon-chip-bg)] text-[color:var(--primary)]">
                      {card.logo ? (
                        <img
                          src={card.logo}
                          alt={card.name}
                          className="h-6 w-6 object-contain"
                        />
                      ) : Icon ? (
                        <Icon size={20} aria-hidden="true" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold leading-snug text-[color:var(--text)]">
                        {card.name}
                      </h3>
                      <p className="text-xs font-medium text-[color:var(--text-muted)] leading-relaxed mt-0.5">
                        {card.provider}
                      </p>
                    </div>
                  </div>

                  <Badge
                    tone={card.tone === "ok" ? "safe" : card.tone === "bad" ? "danger" : "neutral"}
                    className={cn(
                      "shrink-0 border px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] uppercase",
                      BADGE_CLASSES[card.tone]
                    )}
                  >
                    {card.statusText}
                  </Badge>
                </div>

                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[color:var(--text-muted)]">
                  {card.message}
                </p>
              </div>

              <div className="mt-4 border-t border-[color:var(--border)] pt-3 flex items-center justify-between text-xs text-[color:var(--text-muted)]">
                <span className="font-medium">
                  {card.footerLabel}:{" "}
                  <strong className="font-bold text-[color:var(--text)]">
                    {card.footerValue}
                  </strong>
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
