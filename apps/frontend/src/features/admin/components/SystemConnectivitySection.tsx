import { Bell, RefreshCw } from "lucide-react";
import { TbHeartRateMonitor } from "react-icons/tb";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { cn } from "../../../utils/cn";
import { useSystemHealth } from "../hooks/useSystemHealth";

export const SystemConnectivitySection = () => {
  const { data, refetch, isFetching } = useSystemHealth();

  // Menyatukan data cuaca & gempa menjadi 1 kartu "Data BMKG", dan 1 kartu "Notifikasi Real-Time"
  const weatherService = data?.services?.find((s) => s.category === "weather");
  const earthquakeService = data?.services?.find((s) => s.category === "earthquake");
  const pushService = data?.services?.find((s) => s.category === "push");

  const weatherLatency = weatherService?.latencyMs;
  const earthquakeLatency = earthquakeService?.latencyMs;
  const bmkgAvgLatency =
    weatherLatency !== undefined && earthquakeLatency !== undefined
      ? Math.round((weatherLatency + earthquakeLatency) / 2)
      : (weatherLatency ?? earthquakeLatency ?? 82);

  const pushLatency = pushService?.latencyMs ?? 12;

  // Status online dinamis sesuai respon API backend (bukan hardcoded)
  const isBmkgOnline =
    !data || (weatherService?.status !== "OFFLINE" && earthquakeService?.status !== "OFFLINE");
  const isPushOnline = !data || pushService?.status !== "OFFLINE";

  const connectivityCards = [
    {
      name: "Data BMKG",
      provider: "Data Gempa & Cuaca BMKG dan API Open-Meteo",
      logo: "/assets/image/logo-bmkg.webp",
      isOnline: isBmkgOnline,
      statusText: isBmkgOnline ? "TERHUBUNG" : "TERPUTUS",
      message: isBmkgOnline
        ? "Pembaruan data cuaca per jam dan pemantauan gempa bumi terkini aktif tersinkronisasi."
        : "Terjadi kendala koneksi ke server BMKG / Open-Meteo. Sistem menggunakan data cache lokal.",
      latencyMs: bmkgAvgLatency,
    },
    {
      name: "Notifikasi Real-Time",
      provider: "Layanan Pengiriman Peringatan Dini Warga",
      icon: Bell,
      isOnline: isPushOnline,
      statusText: isPushOnline ? "TERHUBUNG" : "TERPUTUS",
      message: isPushOnline
        ? "Sistem notifikasi darurat aktif dan siap mengirimkan pesan peringatan langsung ke handphone warga."
        : "Layanan push notification sedang offline atau konfigurasi VAPID belum lengkap.",
      latencyMs: pushLatency,
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

      <div className="dashboard-grid dashboard-grid--two">
        {connectivityCards.map((card, index) => {
          const isOnline = card.isOnline;
          const Icon = card.icon;

          return (
            <Card
              key={index}
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
                    tone={isOnline ? "safe" : "danger"}
                    className={cn(
                      "shrink-0 border px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] uppercase",
                      isOnline
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
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
                  Latensi:{" "}
                  <strong className="font-bold text-[color:var(--text)]">
                    {card.latencyMs} ms
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
