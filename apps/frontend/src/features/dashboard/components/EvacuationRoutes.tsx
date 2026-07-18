import { Map } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import type { EvacuationPoint, EvacuationRoute } from "../../../types/dashboard";
import { dummyEvacuation } from "../data/dummyData";
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
}: EvacuationRoutesProps) => {
  const showFallback = isPointsError || isRoutesError || points.length === 0;

  return (
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
      ) : showFallback ? (
        <Card className="evacuation-preview">
          <img
            className="evacuation-preview__image"
            src={dummyEvacuation.image}
            alt={dummyEvacuation.title}
            loading="lazy"
          />
          <div className="evacuation-preview__body">
            <h3>{dummyEvacuation.title}</h3>
            <p>{dummyEvacuation.description}</p>
            <div className="evacuation-preview__details">
              {dummyEvacuation.details.map((detail) => (
                <div className="evacuation-preview__detail" key={detail.label}>
                  <span>{detail.label}</span>
                  <strong>{detail.value}</strong>
                </div>
              ))}
            </div>
            <Button type="button" variant="secondary" disabled>
              {dummyEvacuation.buttonLabel}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="evacuation-layout">
          <EvacuationMap points={points} routes={routes} />
          <div className="evacuation-list">
            {points.slice(0, 4).map((point, index) => (
              <article className="evacuation-point" key={point.id}>
                <span>{index + 1}</span>
                <div>
                  <strong>{point.name}</strong>
                  <small>{point.description ?? point.address ?? "Titik evakuasi resmi"}</small>
                </div>
                {point.capacity && <small>{point.capacity} org</small>}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};