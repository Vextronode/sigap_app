import { Activity } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import type { Earthquake } from "../../../types/dashboard";
import { formatDateTime } from "../../../utils/date";

type EarthquakeCardProps = {
  earthquake: Earthquake | null;
  isLoading?: boolean;
  isError?: boolean;
};

export const EarthquakeCard = ({ earthquake, isLoading = false, isError = false }: EarthquakeCardProps) => {
  if (isLoading) return <CardSkeleton />;

  return (
    <Card
      className="earthquake-card"
      title="Info Gempa Terkini"
      icon={<Activity size={22} />}
      action={earthquake ? <Badge tone="safe">{earthquake.potential}</Badge> : undefined}
    >
      {isError ? (
        <StateMessage
          type="error"
          title="Data gempa gagal dimuat"
          message="Informasi gempa terbaru belum dapat diambil dari API."
        />
      ) : earthquake ? (
        <>
          <div className="two-column-metric">
            <div>
              <span>Magnitudo</span>
              <strong>{earthquake.magnitude} M</strong>
            </div>
            <div>
              <span>Kedalaman</span>
              <strong>{earthquake.depth}</strong>
            </div>
          </div>
          <div className="detail-block">
            <span>Lokasi pusat gempa</span>
            <strong>{earthquake.location}</strong>
          </div>
          <div className="inline-note">
            <span>Jarak dari Desa Cibenda</span>
            <strong>~{earthquake.distanceToVillage} km</strong>
          </div>
          <small className="muted">Pembaruan BMKG: {formatDateTime(earthquake.updatedAt)}</small>
        </>
      ) : (
        <StateMessage title="Data gempa belum tersedia" message="Informasi gempa terbaru belum dikirim oleh backend." />
      )}
    </Card>
  );
};
