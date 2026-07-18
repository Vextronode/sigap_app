import { Waves } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import type { TsunamiStatus } from "../../../types/dashboard";
import { formatDateTime } from "../../../utils/date";

type TsunamiCardProps = {
  tsunami: TsunamiStatus | null;
  isLoading?: boolean;
  isError?: boolean;
};

export const TsunamiCard = ({
  tsunami,
  isLoading = false,
  isError = false,
}: TsunamiCardProps) => {
  if (isLoading) return <CardSkeleton />;

  const badgeTone =
    tsunami?.status === "NORMAL"
      ? "safe"
      : tsunami?.status === "WASPADA"
      ? "warning"
      : tsunami?.status === "SIAGA"
      ? "orange"
      : "danger";

  const badgeText =
    tsunami?.status === "NORMAL"
      ? "Tidak Berpotensi Tsunami"
      : tsunami?.status === "WASPADA"
      ? "Potensi Tsunami"
      : tsunami?.status === "SIAGA"
      ? "Siaga Tsunami"
      : "Awas Tsunami";

  return (
    <Card
      className="tsunami-card"
      title="Status Tsunami"
      icon={<Waves size={26} />}
      action={tsunami ? <Badge tone={badgeTone}>{badgeText}</Badge> : undefined}
    >
      {isError ? (
        <StateMessage
          type="error"
          title="Status tsunami gagal dimuat"
          message="Informasi resmi InaTEWS belum dapat diambil dari API."
        />
      ) : tsunami ? (
        <>
          {/* Icon */}
          <div className="tsunami-visual">
            <Waves size={58} aria-hidden="true" />
          </div>

          {/* Status */}
          <div className="tsunami-status">
            {tsunami.status}
          </div>

          {/* Description */}
          <p className="tsunami-description">
            <span>{tsunami.description}</span>
          </p>

          <hr className="card-divider" />

          {/* Metadata */}
          <div className="detail-block">
            <span className="detail-label">
              Sumber Data
            </span>

            <strong className="detail-value">
              {tsunami.source}
            </strong>
          </div>

          <div className="detail-block">
            <span className="detail-label">
              Terakhir Diperbarui
            </span>

            <strong className="detail-value">
              {formatDateTime(tsunami.updatedAt)}
            </strong>
          </div>
        </>
      ) : (
        <StateMessage
          title="Status tsunami belum tersedia"
          message="Informasi resmi InaTEWS belum dikirim oleh backend."
        />
      )}
    </Card>
  );
};