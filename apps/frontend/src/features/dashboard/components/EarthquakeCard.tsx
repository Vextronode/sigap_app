import { Map } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { CardSkeleton, Skeleton } from "../../../components/ui/Skeleton";
import type { Earthquake } from "../../../types/dashboard";
import { cn } from "../../../utils/cn";
import { formatDateTime } from "../../../utils/date";

type EarthquakeCardProps = {
  title: string;
  earthquake: Earthquake | null;
  isLoading?: boolean;
  isError?: boolean;
};

type EarthquakeVariant = "indonesia" | "west-java" | "pangandaran";

const getVariant = (title: string): EarthquakeVariant => {
  if (title.toLowerCase().includes("jawa barat")) return "west-java";
  if (title.toLowerCase().includes("pangandaran")) return "pangandaran";
  return "indonesia";
};

const IndonesiaFlagIcon = () => (
  <img
    src="/assets/image/logo-indonesia.svg"
    alt="Bendera Indonesia"
    className="h-7 w-10 shrink-0 rounded-[3px] border border-slate-300/40 object-contain shadow-sm dark:border-slate-700/60"
  />
);

const JawaBaratIcon = () => (
  <img
    src="/assets/image/logo-jawabarat.svg"
    alt="Logo Jawa Barat"
    className="h-10 w-10 shrink-0 object-contain drop-shadow-sm"
  />
);

const PangandaranIcon = () => (
  <img
    src="/assets/image/logo-pangandaran.svg"
    alt="Logo Pangandaran"
    className="h-10 w-10 shrink-0 object-contain drop-shadow-sm"
  />
);

const variantConfig: Record<
  EarthquakeVariant,
  {
    renderCustomIcon: () => ReactNode;
    accentBorder: string;
    badgeTone: "safe" | "danger";
    badgeClassName: string;
    titleClassName: string;
    valueClassName: string;
    noteClassName: string;
    emptyTitle: string;
    emptyMessage: string;
  }
> = {
  indonesia: {
    renderCustomIcon: () => <IndonesiaFlagIcon />,
    accentBorder: "border-slate-200/60 dark:border-slate-800",
    badgeTone: "safe",
    badgeClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    titleClassName: "text-foreground",
    valueClassName: "text-blue-600 dark:text-blue-400",
    noteClassName: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    emptyTitle: "Data Belum Tersedia",
    emptyMessage: "Informasi gempa Indonesia belum dapat ditampilkan saat ini.",
  },
  "west-java": {
    renderCustomIcon: () => <JawaBaratIcon />,
    accentBorder: "border-slate-200/60 dark:border-slate-800",
    badgeTone: "safe",
    badgeClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    titleClassName: "text-foreground",
    valueClassName: "text-blue-600 dark:text-blue-400",
    noteClassName: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    emptyTitle: "Data Belum Tersedia",
    emptyMessage: "Informasi gempa Jawa Barat belum tersedia saat ini.",
  },
  pangandaran: {
    renderCustomIcon: () => <PangandaranIcon />,
    accentBorder: "border-slate-200/60 dark:border-slate-800",
    badgeTone: "safe",
    badgeClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    titleClassName: "text-foreground",
    valueClassName: "text-emerald-600 dark:text-emerald-400",
    noteClassName: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    emptyTitle: "Data Belum Tersedia",
    emptyMessage:
      "Tidak ada gempa yang berdampak ke wilayah sekitar Desa Cibenda pada data saat ini dari BMKG.",
  },
};

const formatDistance = (distance: number) => `± ${Math.abs(distance)} KM`;

type TsunamiBadge = { tone: "safe" | "danger"; text: string };

const getTsunamiBadge = (potential: string | undefined): TsunamiBadge | null => {
  const normalized = potential?.trim().toLowerCase();
  if (normalized === "tidak berpotensi tsunami") {
    return { tone: "safe", text: "TIDAK BERPOTENSI TSUNAMI" };
  }
  if (normalized === "berpotensi tsunami") {
    return { tone: "danger", text: "BERPOTENSI TSUNAMI" };
  }
  return null;
};

type ShakemapImageProps = {
  url: string;
  alt: string;
};

const ShakemapImage = ({ url, alt }: ShakemapImageProps) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  return (
    <>
      <img
        src={url}
        alt={alt}
        className={cn(
          "h-full w-full object-contain transition-opacity duration-300",
          status === "loaded" ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
      {status === "loading" && (
        <Skeleton className="absolute inset-0 h-full w-full !rounded-none" />
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <Map className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs font-medium text-muted-foreground">
            Gambar Titik Lokasi Guncangan
            <br />
            Belum Tersedia Oleh BMKG
          </p>
        </div>
      )}
    </>
  );
};

export const EarthquakeCard = ({
  title,
  earthquake,
  isLoading = false,
  isError = false,
}: EarthquakeCardProps) => {
  const displayEarthquake = isError ? null : earthquake;
  const shakemapUrl = displayEarthquake?.shakemap;

  if (isLoading) return <CardSkeleton />;

  const variant = getVariant(title);
  const config = variantConfig[variant];
  const tsunamiBadge =
    variant === "indonesia" ? null : getTsunamiBadge(displayEarthquake?.potential);
  const isDanger = tsunamiBadge?.tone === "danger";

  const cardBorderClass = isDanger ? "border-red-500/30" : config.accentBorder;
  const dataToneClass = isDanger ? "text-red-600 dark:text-red-400" : config.valueClassName;
  const noteToneClass = isDanger
    ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
    : config.noteClassName;

  const regionLabel = title.replace(/^Info Gempa\s*/i, "");

  if (!displayEarthquake) {
    return (
      <Card
        className={cn(
          "!p-0 overflow-hidden border border-[color:var(--border)] bg-card shadow-sm h-full flex flex-col",
          cardBorderClass
        )}
      >
        <div className="flex h-full min-h-[420px] flex-col justify-between">
          <div className="flex items-center gap-3 border-b border-[color:var(--border)] px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center">
              {config.renderCustomIcon()}
            </div>
            <div className="min-w-0">
              <p className={cn("text-base font-bold leading-tight", config.titleClassName)}>
                Info Gempa
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                {regionLabel}
              </p>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center px-6 py-8 text-center">
            <div className="max-w-[240px]">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-[color:var(--border)] bg-muted/50 text-muted-foreground">
                {config.renderCustomIcon()}
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {config.emptyTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {config.emptyMessage}
              </p>
            </div>
          </div>

          <div className="border-t border-[color:var(--border)] px-5 py-3 text-center text-[11px] italic text-muted-foreground">
            Menunggu data gempa dari BMKG untuk sinkronisasi otomatis...
          </div>
        </div>
      </Card>
    );
  }

  const formattedDate = formatDateTime(displayEarthquake.updatedAt);

  return (
    <Card
      className={cn(
        "!p-0 overflow-hidden border border-[color:var(--border)] bg-card shadow-sm h-full flex flex-col",
        cardBorderClass
      )}
    >
      <div className="flex h-full min-h-[420px] flex-col justify-between">
        {variant === "pangandaran" && (
          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden border-b border-[color:var(--border)] bg-muted sm:aspect-video">
            {shakemapUrl ? (
              <ShakemapImage
                key={shakemapUrl}
                url={shakemapUrl}
                alt={`Peta guncangan gempa ${displayEarthquake.location}`}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
                <Map className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="text-xs font-medium text-muted-foreground">
                  Gambar Peta Lokasi Guncangan
                  <br />
                  Belum Tersedia Oleh BMKG
                </p>
              </div>
            )}
          </div>
        )}

        <div className="border-b border-[color:var(--border)] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center">
              {config.renderCustomIcon()}
            </div>

            <div className="min-w-0">
              <p className={cn("text-base font-bold leading-tight", config.titleClassName)}>
                Info Gempa
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                {regionLabel}
              </p>
            </div>
          </div>

          {tsunamiBadge && (
            <Badge
              tone={tsunamiBadge.tone}
              className={cn(
                "mt-3 w-fit border px-3 py-1 text-[10px] font-semibold tracking-[0.18em]",
                config.badgeClassName,
                isDanger
                  ? "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
                  : ""
              )}
            >
              {tsunamiBadge.text}
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col px-5 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                Magnitudo
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <strong className={cn("text-[2.5rem] font-extrabold leading-none", dataToneClass)}>
                  {displayEarthquake.magnitude}
                </strong>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                Kedalaman
              </span>
              <div className="mt-1 flex items-baseline justify-end gap-2">
                <strong className={cn("text-[1.65rem] font-extrabold leading-none", dataToneClass)}>
                  {displayEarthquake.depth}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
              Lokasi Pusat Gempa:
            </span>
            <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
              {displayEarthquake.location}
            </p>
          </div>

          <div className={cn("mt-5 rounded-2xl border px-4 py-4", noteToneClass)}>
            <div className="grid grid-cols-[1fr_auto] items-center gap-4">
              <div>
                <p className="text-[13px] font-medium text-[color:var(--text-muted)]">
                  Jarak dari Desa Cibenda
                </p>
              </div>
              <div className="text-right">
                <div className={cn("text-base font-extrabold leading-none", dataToneClass)}>
                  {formatDistance(displayEarthquake.distanceToVillage)}
                </div>
              </div>
            </div>
          </div>

          <div className="my-5 border-t border-[color:var(--border)]" />

          <div className="mt-auto grid grid-cols-2 gap-4 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <div>
              <div className="text-[color:var(--text-muted)]">Sumber Data</div>
              <div className="mt-1 text-sm font-semibold uppercase tracking-normal text-foreground">
                BMKG
              </div>
            </div>
            <div className="text-right">
              <div className="text-[color:var(--text-muted)]">Terjadi</div>
              <div className="mt-1 text-right leading-4 normal-case">
                <p className="text-xs font-semibold leading-tight text-foreground">
                  {formattedDate.time}
                </p>
                <p className="text-xs font-semibold leading-tight text-foreground">
                  {formattedDate.date}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};