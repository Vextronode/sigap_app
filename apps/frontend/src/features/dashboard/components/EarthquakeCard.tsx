import { Globe, Map, MapPin, type LucideIcon } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { CardSkeleton } from "../../../components/ui/Skeleton";
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

const variantConfig: Record<
  EarthquakeVariant,
  {
    icon: LucideIcon;
    iconClassName: string;
    accentBorder: string;
    badgeTone: "safe" | "danger";
    badgeClassName: string;
    titleClassName: string;
    valueClassName: string;
    noteClassName: string;
    emptyClassName: string;
    emptyIconClassName: string;
    emptyTitle: string;
    emptyMessage: string;
  }
> = {
  indonesia: {
    icon: Globe,
    iconClassName: "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20",
    accentBorder: "border-slate-200/60 dark:border-slate-800",
    badgeTone: "safe",
    badgeClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    titleClassName: "text-foreground",
    valueClassName: "text-blue-600 dark:text-blue-400",
    noteClassName: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    emptyClassName: "border-[color:var(--border)] bg-card",
    emptyIconClassName: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    emptyTitle: "Data Belum Tersedia",
    emptyMessage: "Informasi gempa Indonesia belum dapat ditampilkan saat ini.",
  },
  "west-java": {
    icon: Map,
    iconClassName: "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20",
    accentBorder: "border-slate-200/60 dark:border-slate-800",
    badgeTone: "safe",
    badgeClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    titleClassName: "text-foreground",
    valueClassName: "text-blue-600 dark:text-blue-400",
    noteClassName: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    emptyClassName: "border-[color:var(--border)] bg-card",
    emptyIconClassName: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    emptyTitle: "Data Belum Tersedia",
    emptyMessage: "Informasi gempa Jawa Barat belum tersedia saat ini.",
  },
  pangandaran: {
    icon: MapPin,
    iconClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20",
    accentBorder: "border-slate-200/60 dark:border-slate-800",
    badgeTone: "safe",
    badgeClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    titleClassName: "text-foreground",
    valueClassName: "text-emerald-600 dark:text-emerald-400",
    noteClassName: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    emptyClassName: "border-[color:var(--border)] bg-card",
    emptyIconClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    emptyTitle: "Data Belum Tersedia",
    emptyMessage:
      "Tidak ada gempa yang berdampak ke wilayah sekitar Desa Cibenda pada data saat ini dari BMKG.",
  },
};

const formatDistance = (distance: number) => `≈ ${Math.abs(distance)} KM`;

export const EarthquakeCard = ({
  title,
  earthquake,
  isLoading = false,
  isError = false,
}: EarthquakeCardProps) => {
  if (isLoading) return <CardSkeleton />;

  const variant = getVariant(title);
  const config = variantConfig[variant];
  const displayEarthquake = isError ? null : earthquake;
  const isTsunamiPotential =
    displayEarthquake?.potential?.toLowerCase().includes("berpotensi") ?? false;
  const cardBorderClass =
    variant === "west-java" && isTsunamiPotential
      ? "border-red-500/30"
      : config.accentBorder;
  const badgeTone = isTsunamiPotential ? "danger" : config.badgeTone;
  const badgeText = isTsunamiPotential
    ? "BERPOTENSI TSUNAMI"
    : "TIDAK BERPOTENSI TSUNAMI";
  const RegionIcon = config.icon;
  const regionLabel = title.replace(/^Info Gempa\s*/i, "");
  const dataToneClass =
    variant === "west-java" && isTsunamiPotential
      ? "text-red-600 dark:text-red-400"
      : config.valueClassName;
  const noteToneClass =
    variant === "west-java" && isTsunamiPotential
      ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
      : config.noteClassName;

  if (!displayEarthquake) {
    return (
      <Card
        className={cn(
          "!p-0 overflow-hidden border border-[color:var(--border)] bg-card shadow-sm h-full flex flex-col",
          cardBorderClass
        )}
      >
        <div className="flex h-full min-h-[420px] flex-col justify-between">
          <div className="flex items-start gap-3 border-b border-[color:var(--border)] px-5 py-4">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                config.emptyIconClassName
              )}
            >
              <RegionIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className={cn("text-sm font-semibold leading-tight", config.titleClassName)}>
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
                <RegionIcon className="h-6 w-6" aria-hidden="true" />
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
  const iconClassName = isTsunamiPotential
    ? "bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20"
    : config.iconClassName;

  return (
    <Card
      className={cn(
        "!p-0 overflow-hidden border border-[color:var(--border)] bg-card shadow-sm h-full flex flex-col",
        cardBorderClass
      )}
    >
      <div className="flex h-full min-h-[420px] flex-col justify-between">
        <div className="border-b border-[color:var(--border)] px-5 py-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                iconClassName
              )}
            >
              <RegionIcon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className={cn("text-sm font-semibold", config.titleClassName)}>
                Info Gempa
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                {regionLabel}
              </p>
            </div>
          </div>

          <Badge
            tone={badgeTone}
            className={cn(
              "mt-3 w-fit border px-3 py-1 text-[10px] font-semibold tracking-[0.18em]",
              config.badgeClassName,
              variant === "west-java" && isTsunamiPotential
                ? "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
                : ""
            )}
          >
            {badgeText}
          </Badge>
        </div>

        <div className="flex flex-1 flex-col px-5 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Magnitude
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <strong className={cn("text-[2.5rem] font-extrabold leading-none", dataToneClass)}>
                  {displayEarthquake.magnitude}
                </strong>
                <span className={cn("text-xl font-semibold", dataToneClass)}>
                  M
                </span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Kedalaman
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <strong className={cn("text-[1.65rem] font-extrabold leading-none", dataToneClass)}>
                  {displayEarthquake.depth}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Lokasi Pusat Gempa:
            </span>
            <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
              {displayEarthquake.location}
            </p>
          </div>

          <div className={cn("mt-5 rounded-2xl border px-4 py-4", noteToneClass)}>
            <div className="grid grid-cols-[1fr_auto] items-center gap-4">
              <div>
                <p className="text-[13px] opacity-90">
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
              <div>Sumber Data</div>
              <div className="mt-1 text-sm font-semibold uppercase tracking-normal text-foreground">
                BMKG
              </div>
            </div>
            <div className="text-right">
              <div>Terjadi</div>
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