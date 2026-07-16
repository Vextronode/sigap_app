import { Map } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import type { EvacuationPoint, EvacuationRoute } from "../../../types/dashboard";
import { EvacuationMap } from "./EvacuationMap";

type EvacuationRoutesProps = {
  points: EvacuationPoint[];
  routes: EvacuationRoute[];
  isPointsLoading?: boolean;
  isRoutesLoading?: boolean;
  isPointsError?: boolean;
  isRoutesError?: boolean;
};

export const EvacuationRoutes = ({
  points,
  routes,
  isPointsLoading = false,
  isRoutesLoading = false,
  isPointsError = false,
  isRoutesError = false,
}: EvacuationRoutesProps) => (
  <section aria-labelledby="evacuation">
    <SectionHeader id="evacuation" title="Jalur & Titik Evakuasi" icon={<Map size={22} />} />
    {isPointsLoading || isRoutesLoading ? (
      <div className="evacuation-layout">
        <CardSkeleton />
        <div className="evacuation-list">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    ) : isPointsError ? (
      <StateMessage
        type="error"
        title="Titik evakuasi gagal dimuat"
        message="Peta dan titik evakuasi belum dapat diambil dari API."
      />
    ) : (
      <div className="evacuation-layout">
        <EvacuationMap points={points} routes={isRoutesError ? [] : routes} />
        <div className="evacuation-list">
          {isRoutesError && (
            <StateMessage
              type="error"
              title="Jalur evakuasi gagal dimuat"
              message="Titik evakuasi tetap ditampilkan tanpa garis rute."
            />
          )}
          {points.length > 0 ? (
            points.slice(0, 4).map((point, index) => (
              <article className="evacuation-point" key={point.id}>
                <span>{index + 1}</span>
                <div>
                  <strong>{point.name}</strong>
                  <small>{point.description ?? point.address ?? "Titik evakuasi resmi"}</small>
                </div>
                {point.capacity && <small>{point.capacity} org</small>}
              </article>
            ))
          ) : (
            <StateMessage title="Titik belum tersedia" message="Belum ada titik evakuasi aktif." />
          )}
        </div>
      </div>
    )}
  </section>
);
