import { GiBigWave } from "react-icons/gi";
import { Card } from "../../../components/ui/Card";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import type { TsunamiStatus } from "../../../types/dashboard";
import { cn } from "../../../utils/cn";
import { formatDateTime } from "../../../utils/date";

type TsunamiCardProps = {
  tsunami: TsunamiStatus | null;
  isLoading?: boolean;
  isError?: boolean;
};

type TsunamiTone = "safe" | "warning" | "orange" | "danger";

const getTone = (status?: TsunamiStatus["status"]): TsunamiTone | null => {
  switch (status) {
    case "AWAS":
      return "danger";
    case "SIAGA":
      return "orange";
    case "WASPADA":
      return "warning";
    case "NORMAL":
      return "safe";
    default:
      return null;
  }
};

const getStatusLabel = (status?: TsunamiStatus["status"]) => {
  switch (status) {
    case "AWAS":
      return "AWAS";
    case "SIAGA":
      return "SIAGA";
    case "WASPADA":
      return "WASPADA";
    case "NORMAL":
      return "NORMAL";
    default:
      return null;
  }
};

const toneConfig: Record<TsunamiTone, { dot: string; text: string }> = {
  safe: { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  warning: { dot: "bg-[#ffc642]", text: "text-amber-700 dark:text-amber-300" },
  orange: { dot: "bg-orange-500", text: "text-orange-600 dark:text-orange-400" },
  danger: { dot: "bg-red-500", text: "text-red-600 dark:text-red-400" },
};

export const TsunamiCard = ({
  tsunami,
  isLoading = false,
  isError = false,
}: TsunamiCardProps) => {
  if (isLoading) return <CardSkeleton />;

  const displayTsunami = isError ? null : tsunami;
  const tone = getTone(displayTsunami?.status);
  const statusLabel = getStatusLabel(displayTsunami?.status);

  const formattedDate = displayTsunami
    ? formatDateTime(displayTsunami.updatedAt)
    : null;

  return (
    <Card className="!p-0 overflow-hidden border border-[color:var(--border)] bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3 px-5 py-4 lg:items-center lg:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
            <GiBigWave size={24} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-bold text-foreground">
              Status Tsunami
            </h3>
            <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
              Desa Cibenda 
            </span>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {displayTsunami
                ? displayTsunami.description
                : "Informasi status tsunami belum tersedia saat ini."}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          {tone && statusLabel ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                    toneConfig[tone].dot
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "relative inline-flex h-2.5 w-2.5 rounded-full",
                    toneConfig[tone].dot
                  )}
                  aria-hidden="true"
                />
              </span>
              <span className={cn("text-sm font-bold uppercase tracking-wide", toneConfig[tone].text)}>
                {statusLabel}
              </span>
            </div>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">
              Status belum tersedia
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-[color:var(--border)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        <div>
          <div className="text-[color:var(--text-muted)]">Sumber</div>

          <div className="mt-1 text-sm font-semibold uppercase tracking-normal text-foreground">
            {displayTsunami?.source ?? "BMKG InaTEWS"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[color:var(--text-muted)]">Update</div>

          <div className="mt-1 leading-4 normal-case">
            {formattedDate ? (
              <>
                <div className="text-xs font-semibold text-foreground">
                  {formattedDate.time}
                </div>

                <div className="text-xs font-semibold text-foreground">
                  {formattedDate.date}
                </div>
              </>
            ) : (
              <div className="text-xs text-foreground">-</div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};