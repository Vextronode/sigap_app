import { Waves } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
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

const getTone = (status?: TsunamiStatus["status"]) => {
  switch (status) {
    case "AWAS":
      return "danger" as const;
    case "SIAGA":
      return "orange" as const;
    case "WASPADA":
      return "warning" as const;
    case "NORMAL":
      return "safe" as const;
    default:
      return null; 
  }
};

const getBadgeText = (status?: TsunamiStatus["status"]) => {
  switch (status) {
    case "AWAS":
      return "AWAS";
    case "SIAGA":
      return "SIAGA";
    case "WASPADA":
      return "WASPADA";
    case "NORMAL":
      return "TIDAK BERPOTENSI TSUNAMI - NORMAL";
    default:
      return null;
  }
};

export const TsunamiCard = ({
  tsunami,
  isLoading = false,
  isError = false,
}: TsunamiCardProps) => {
  if (isLoading) return <CardSkeleton />;

  const displayTsunami = isError ? null : tsunami;
  const badgeTone = getTone(displayTsunami?.status);
  const badgeText = getBadgeText(displayTsunami?.status);

  const formattedDate = displayTsunami
    ? formatDateTime(displayTsunami.updatedAt)
    : null;

  return (
    <Card className="!p-0 overflow-hidden border border-[color:var(--border)] bg-card shadow-sm">
      <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
            <Waves size={24} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                Status Tsunami
              </h3>
              <span className="text-xs font-medium text-muted-foreground">
                Pantai Cibenda & Sekitarnya
              </span>
            </div>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {displayTsunami
                ? displayTsunami.description
                : "Informasi status tsunami belum tersedia saat ini."}
            </p>
          </div>
        </div>

        {badgeTone && badgeText ? (
          <Badge
            tone={badgeTone}
            className={cn(
              "w-fit border px-3 py-1 text-[11px] font-semibold tracking-[0.18em]",
              badgeTone === "safe"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : badgeTone === "warning"
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : badgeTone === "orange"
                    ? "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    : "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
            )}
          >
            {badgeText}
          </Badge>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">
            Status belum tersedia
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 border-t border-[color:var(--border)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        <div>
          <div>Sumber</div>

          <div className="mt-1 text-sm font-semibold uppercase tracking-normal text-foreground">
            {displayTsunami?.source ?? "BMKG InaTEWS"}
          </div>
        </div>

        <div className="text-right">
          <div>Update</div>

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