import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import type { CurrentAlert } from "../../../types/dashboard";
import { formatDateTime } from "../../../utils/date";
import { getAlertMeta } from "../../../utils/status";

type CurrentAlertCardProps = {
  alert: CurrentAlert | null;
  isLoading?: boolean;
  isError?: boolean;
};

export const CurrentAlertCard = ({ alert, isLoading = false, isError = false }: CurrentAlertCardProps) => {
  if (isLoading) {
    return (
      <section className="status-banner status-banner--safe" aria-label="Memuat status kesiapsiagaan">
        <Skeleton className="status-banner__icon" />
        <Skeleton className="skeleton--title" />
        <Skeleton className="skeleton--line skeleton--short" />
      </section>
    );
  }

  if (isError) {
    return (
      <StateMessage
        type="error"
        title="Status kesiapsiagaan gagal dimuat"
        message="Status resmi belum dapat diambil. Bagian dashboard lain tetap tersedia."
      />
    );
  }

  const meta = getAlertMeta(alert);
  const isSafe = meta.tone === "safe";
  const Icon = isSafe ? CheckCircle2 : ShieldAlert;

  return (
    <section className={`status-banner status-banner--${meta.tone}`} aria-labelledby="status-title">
      <span className="status-banner__icon">
        <Icon size={44} aria-hidden="true" />
      </span>
      <Badge tone={meta.tone}>{`Status: ${meta.label}`}</Badge>
      <h1 id="status-title">{isSafe ? "Status: Aman" : `Status: ${meta.label}`}</h1>
      <p>{alert?.reason ?? meta.description}</p>
      <span className="status-banner__updated">Terakhir diperbarui: {formatDateTime(alert?.lastUpdated)}</span>
    </section>
  );
};
