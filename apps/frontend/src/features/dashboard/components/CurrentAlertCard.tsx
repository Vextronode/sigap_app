import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import type { CurrentAlert } from "../../../types/dashboard";
import { formatDateTime } from "../../../utils/date";
import { getAlertMeta } from "../../../utils/status";

type CurrentAlertCardProps = {
  alert: CurrentAlert | null;
};

export const CurrentAlertCard = ({ alert }: CurrentAlertCardProps) => {
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
