import { Activity } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import type { Earthquake } from "../../../types/dashboard";
import { formatDateTime } from "../../../utils/date";
import { dummyEarthquake } from "../data/dummyData";

type EarthquakeCardProps = {
  earthquake: Earthquake | null;
  isLoading?: boolean;
  isError?: boolean;
};

export const EarthquakeCard = ({ earthquake, isLoading = false, isError = false }: EarthquakeCardProps) => {
  if (isLoading) return <CardSkeleton />;

  const displayEarthquake = earthquake && !isError ? earthquake : dummyEarthquake;
  const hasTsunamiPotential = displayEarthquake.potential?.toLowerCase().includes("berpotensi");

  return (
    <Card
      className="earthquake-card"
      title="Info Gempa Terkini"
      icon={<Activity size={26} />}
      action={
        <Badge tone={hasTsunamiPotential ? "danger" : "safe"}>
          {hasTsunamiPotential ? "Berpotensi Tsunami" : "Tidak Berpotensi Tsunami"}
        </Badge>
      }
    >
      <>
        <div className="two-column-metric">
          <div>
            <span className="metric-label">MAGNITUDO</span>
            <strong className="metric-value">{displayEarthquake.magnitude} M</strong>
          </div>

          <div>
            <span className="metric-label">KEDALAMAN</span>
            <strong className="metric-value">{displayEarthquake.depth}</strong>
          </div>
        </div>

        <div className="detail-block">
          <span className="detail-label">Lokasi Pusat Gempa</span>
          <strong className="detail-value">{displayEarthquake.location}</strong>
        </div>

        {displayEarthquake.felt && (
          <div className="detail-block">
            <span className="detail-label">Dirasakan</span>
            <strong className="detail-value">{displayEarthquake.felt}</strong>
          </div>
        )}

        <div className="inline-note">
          <span>Jarak dari Desa Cibenda</span>
          <strong>≈ {Math.abs(Number(displayEarthquake.distanceToVillage))} km</strong>
        </div>

        <hr className="card-divider" />

        <div className="detail-block">
          <span className="detail-label">Sumber Data</span>
          <strong className="detail-value">BMKG</strong>
        </div>

        <div className="detail-block">
          <span className="detail-label">Terjadi</span>
          <strong className="detail-value">{formatDateTime(displayEarthquake.updatedAt)}</strong>
        </div>
      </>
    </Card>
  );
};
