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

export const EarthquakeCard = ({
  earthquake,
  isLoading = false,
  isError = false,
}: EarthquakeCardProps) => {
  if (isLoading) return <CardSkeleton />;

  const hasTsunamiPotential =
    earthquake?.potential?.toLowerCase().includes("berpotensi");

  return (
    <Card
      className="earthquake-card"
      title="Info Gempa Terkini"
      icon={<Activity size={26} />}
      action={
        earthquake ? (
          <Badge tone={hasTsunamiPotential ? "danger" : "safe"}>
            {hasTsunamiPotential
              ? "Berpotensi Tsunami"
              : "Tidak Berpotensi Tsunami"}
          </Badge>
        ) : undefined
      }
    >
      {isError ? (
        <StateMessage
          type="error"
          title="Data gempa gagal dimuat"
          message="Informasi gempa terbaru belum dapat diambil dari API."
        />
      ) : earthquake ? (
        <>
          {/* Metric */}
          <div className="two-column-metric">
            <div>
              <span className="metric-label">MAGNITUDO</span>
              <strong className="metric-value">
                {earthquake.magnitude} M
              </strong>
            </div>

            <div>
              <span className="metric-label">KEDALAMAN</span>
              <strong className="metric-value">
                {earthquake.depth}
              </strong>
            </div>
          </div>

          {/* Lokasi */}
          <div className="detail-block">
            <span className="detail-label">
              Lokasi Pusat Gempa
            </span>

            <strong className="detail-value">
              {earthquake.location}
            </strong>
          </div>

          {/* Jarak */}
          <div className="inline-note">
            <span>Jarak dari Desa Cibenda</span>

            <strong>
              ≈ {Math.abs(Number(earthquake.distanceToVillage))} km
            </strong>
          </div>

          <hr className="card-divider" />

          {/* Metadata */}
          <div className="detail-block">
            <span className="detail-label">
              Sumber Data
            </span>

            <strong className="detail-value">
              BMKG
            </strong>
          </div>

          <div className="detail-block">
            <span className="detail-label">
              Terjadi
            </span>

            <strong className="detail-value">
              {formatDateTime(earthquake.updatedAt)}
            </strong>
          </div>
        </>
      ) : (
        <StateMessage
          title="Data gempa belum tersedia"
          message="Informasi gempa terbaru belum dikirim oleh backend."
        />
      )}
    </Card>
  );
};