import { Map } from "lucide-react";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { StateMessage } from "../../../components/ui/StateMessage";
import type { EvacuationPoint, EvacuationRoute } from "../../../types/dashboard";
import { EvacuationMap } from "./EvacuationMap";

type EvacuationRoutesProps = {
  points: EvacuationPoint[];
  routes: EvacuationRoute[];
};

export const EvacuationRoutes = ({ points, routes }: EvacuationRoutesProps) => (
  <section aria-labelledby="evacuation">
    <SectionHeader id="evacuation" title="Jalur & Titik Evakuasi" icon={<Map size={22} />} />
    <div className="evacuation-layout">
      <EvacuationMap points={points} routes={routes} />
      <div className="evacuation-list">
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
  </section>
);
