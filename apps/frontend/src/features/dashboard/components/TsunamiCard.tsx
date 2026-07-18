import { Waves } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import type { TsunamiStatus } from "../../../types/dashboard";
import { formatDateTime } from "../../../utils/date";
import { dummyTsunami } from "../data/dummyData";

type TsunamiCardProps = {
  tsunami: TsunamiStatus | null;
  isLoading?: boolean;
  isError?: boolean;
};

export const TsunamiCard = ({ tsunami, isLoading = false, isError = false }: TsunamiCardProps) => {
  if (isLoading) return <CardSkeleton />;

  const displayTsunami = tsunami && !isError ? tsunami : dummyTsunami;

  const badgeTone =
    displayTsunami.status === "NORMAL"
      ? "safe"
      : displayTsunami.status === "WASPADA"
      ? "warning"
      : displayTsunami.status === "SIAGA"
      ? "orange"
      : "danger";

  const badgeText =
    displayTsunami.status === "NORMAL"
      ? "Tidak Berpotensi Tsunami"
      : displayTsunami.status === "WASPADA"
      ? "Potensi Tsunami"
      : displayTsunami.status === "SIAGA"
      ? "Siaga Tsunami"
      : "Awas Tsunami";

  return (
    <Card className="tsunami-card" title="Status Tsunami" icon={<Waves size={26} />} action={<Badge tone={badgeTone}>{badgeText}</Badge>}>
      <>
        <div className="tsunami-visual">
          <Waves size={58} aria-hidden="true" />
        </div>

        <div className="tsunami-status">{displayTsunami.status}</div>

        <p className="tsunami-description">
          <span>{displayTsunami.description}</span>
        </p>

        <hr className="card-divider" />

        <div className="detail-block">
          <span className="detail-label">Sumber Data</span>
          <strong className="detail-value">{displayTsunami.source}</strong>
        </div>

        <div className="detail-block">
          <span className="detail-label">Terakhir Diperbarui</span>
          <strong className="detail-value">{formatDateTime(displayTsunami.updatedAt)}</strong>
        </div>
      </>
    </Card>
  );
};
