import L from "leaflet";
import { MapPin } from "lucide-react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { Card } from "../../../components/ui/Card";
import { StateMessage } from "../../../components/ui/StateMessage";
import type { EvacuationPoint, EvacuationRoute } from "../../../types/dashboard";
import { CIBENDA_CENTER, routeToLatLngs } from "../../../utils/map";

type EvacuationMapProps = {
  points: EvacuationPoint[];
  routes: EvacuationRoute[];
};

const markerIcon = L.divIcon({
  className: "evacuation-marker",
  html: "<span></span>",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export const EvacuationMap = ({ points, routes }: EvacuationMapProps) => (
  <Card className="map-card">
    {points.length > 0 ? (
      <MapContainer center={CIBENDA_CENTER} zoom={14} scrollWheelZoom={false} className="evacuation-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routes.map((route) => {
          const latLngs = routeToLatLngs(route);
          return latLngs.length > 0 ? (
            <Polyline key={route.id} positions={latLngs} pathOptions={{ color: "#0037B0", weight: 4 }} />
          ) : null;
        })}
        {points.map((point) => (
          <Marker key={point.id} position={[point.latitude, point.longitude]} icon={markerIcon}>
            <Popup>
              <strong>{point.name}</strong>
              {point.description && <p>{point.description}</p>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    ) : (
      <StateMessage
        title="Peta evakuasi belum tersedia"
        message="Titik evakuasi resmi belum dikirim oleh backend."
      />
    )}
    <div className="map-card__hint">
      <MapPin size={16} aria-hidden="true" />
      <span>Gunakan rute resmi pemerintah desa saat kondisi darurat.</span>
    </div>
  </Card>
);
