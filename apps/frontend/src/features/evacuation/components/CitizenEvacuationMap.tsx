import React, { useMemo, useState, useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import {
  Navigation,
  Mountain,
  Sparkles,
  ShieldCheck,
  ZoomIn,
} from "lucide-react";
import type { EvacuationPoint } from "../../../types/dashboard";
import type { PointWithDistance, UserCoordinates } from "../hooks/useCitizenLocation";
import { CIBENDA_CENTER } from "../../../utils/map";

interface CitizenEvacuationMapProps {
  points: PointWithDistance[];
  userCoords?: UserCoordinates | null;
  nearestPointId?: string | null;
  selectedPointId?: string | null;
  onSelectPoint?: (point: EvacuationPoint) => void;
  heightClass?: string;
}

// Komponen pengatur interaksi zoom (aktif hanya setelah diklik satu kali)
const MapZoomController = ({
  isInteractive,
  onActivate,
}: {
  isInteractive: boolean;
  onActivate: () => void;
}) => {
  const map = useMap();

  useEffect(() => {
    if (isInteractive) {
      map.scrollWheelZoom.enable();
      map.touchZoom.enable();
    } else {
      map.scrollWheelZoom.disable();
    }
  }, [isInteractive, map]);

  useMapEvents({
    click() {
      onActivate();
    },
  });

  return null;
};

// Auto-pan saat userCoords pertama kali ditemukan
const UserLocationFollower = ({ coords }: { coords?: UserCoordinates | null }) => {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.flyTo([coords.latitude, coords.longitude], 14, { duration: 1.2 });
    }
  }, [coords, map]);

  return null;
};

// Auto-pan saat titik evakuasi dipilih dari kartu sisi kanan
const SelectedPointFollower = ({ point }: { point?: PointWithDistance | null }) => {
  const map = useMap();

  useEffect(() => {
    if (point) {
      map.flyTo([point.latitude, point.longitude], 16, { duration: 0.9 });
    }
  }, [point, map]);

  return null;
};

export const CitizenEvacuationMap: React.FC<CitizenEvacuationMapProps> = ({
  points,
  userCoords,
  nearestPointId,
  selectedPointId,
  onSelectPoint,
  heightClass = "h-[440px] sm:h-[480px]",
}) => {
  const [isZoomActive, setIsZoomActive] = useState(false);

  const defaultCenter = useMemo<[number, number]>(() => {
    if (userCoords) {
      return [userCoords.latitude, userCoords.longitude];
    }
    if (points.length > 0) {
      return [points[0].latitude, points[0].longitude];
    }
    return CIBENDA_CENTER;
  }, [points, userCoords]);

  const createMarkerIcon = (point: PointWithDistance, index: number) => {
    const isNearest = nearestPointId === point.id;
    const isSelected = selectedPointId === point.id;
    const isCore = point.isCore;

    // Warna marker: Terdekat = Emas/Amber, Terpilih = Biru Langit, Inti = Biru Tua, Biasa = Teal
    const bgColor = isNearest
      ? "#F59E0B"
      : isSelected
        ? "#2563EB"
        : isCore
          ? "#00247D"
          : "#0D9488";

    const pulseRing = isNearest
      ? `<div style="
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 3px solid #F59E0B;
          animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          opacity: 0.75;
          pointer-events: none;
        "></div>`
      : "";

    const size = isNearest || isSelected ? 38 : 32;
    const fontSize = isNearest || isSelected ? "13px" : "11px";

    return L.divIcon({
      className: "citizen-map-pin",
      html: `
        <div style="position: relative; width: ${size}px; height: ${size}px;">
          ${pulseRing}
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${size}px;
            height: ${size}px;
            background-color: ${bgColor};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
            border: 2px solid #ffffff;
            transition: all 0.2s ease;
          ">
            <span style="
              transform: rotate(45deg);
              color: #ffffff;
              font-size: ${fontSize};
              font-weight: 800;
              font-family: system-ui, -apple-system, sans-serif;
              line-height: 1;
              letter-spacing: -0.5px;
              text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            ">${index + 1}</span>
          </div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    });
  };

  const nearestPoint = useMemo(() => {
    return points.find((p) => p.id === nearestPointId);
  }, [points, nearestPointId]);

  const selectedPoint = useMemo(() => {
    return points.find((p) => p.id === selectedPointId) || null;
  }, [points, selectedPointId]);

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm z-0 group`}
      onMouseLeave={() => setIsZoomActive(false)}
    >
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={false}
        touchZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapZoomController
          isInteractive={isZoomActive}
          onActivate={() => setIsZoomActive(true)}
        />

        <UserLocationFollower coords={userCoords} />
        <SelectedPointFollower point={selectedPoint} />

        {/* Marker Posisi Warga (jika GPS aktif) */}
        {userCoords && (
          <CircleMarker
            center={[userCoords.latitude, userCoords.longitude]}
            radius={8}
            pathOptions={{
              fillColor: "#3B82F6",
              fillOpacity: 1,
              color: "#FFFFFF",
              weight: 3,
            }}
          >
            <Popup className="sigap-map-popup">
              <div className="text-center py-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                  <Navigation size={12} className="text-blue-600 animate-pulse" />
                  Posisi Anda Saat Ini
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  GPS perangkat terhubung akurat
                </p>
              </div>
            </Popup>
          </CircleMarker>
        )}

        {/* Marker Seluruh Titik Evakuasi */}
        {points.map((point, index) => {
          const isNearest = nearestPointId === point.id;
          const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}&travelmode=walking`;

          return (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={createMarkerIcon(point, index)}
              eventHandlers={{
                click: () => onSelectPoint?.(point),
              }}
            >
              <Popup className="sigap-map-popup">
                <div
                  className="p-1 space-y-2.5 text-left min-w-[220px] font-sans"
                  style={{ fontFamily: "inherit" }}
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isNearest && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        <Sparkles size={11} /> Terdekat
                      </span>
                    )}
                    {point.isCore && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#00247D]">
                        <ShieldCheck size={11} /> Utama
                      </span>
                    )}
                    {point.elevation && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <Mountain size={11} /> {point.elevation} mdpl
                      </span>
                    )}
                    {point.distanceLabel && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        <Navigation size={10} /> ±{point.distanceLabel}
                      </span>
                    )}
                  </div>

                  <strong className="block text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    {point.name}
                  </strong>

                  {point.address && (
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {point.address}
                    </p>
                  )}

                  {point.capacity && (
                    <div className="text-[11px] text-slate-700 font-medium">
                      Kapasitas: <span className="font-bold">{point.capacity.toLocaleString()} Jiwa</span>
                    </div>
                  )}

                  {point.facilities && point.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {point.facilities.slice(0, 3).map((f) => (
                        <span
                          key={f}
                          className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-700 font-medium"
                        >
                          {f}
                        </span>
                      ))}
                      {point.facilities.length > 3 && (
                        <span className="text-[9px] text-slate-400">
                          +{point.facilities.length - 3} lainnya
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tombol Buka Rute Google Maps di Pop Up (Teks putih tebal, ikon panah di kanan) */}
                  <div className="pt-2">
                    <a
                      href={googleMapsDirUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#ffffff" }}
                      className="group inline-flex items-center justify-center gap-2 w-full px-3.5 py-2.5 bg-[#00247D] hover:bg-[#001D66] !text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <span className="!text-white font-bold">Buka Rute Google Maps</span>
                      <Navigation
                        size={13}
                        className="!text-white shrink-0 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform"
                      />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Info Tag: Peta Sebaran Evakuasi - sedikit di atas attribution Leaflet */}
      <div className="absolute bottom-6 left-3 z-1000 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
        <span>Total {points.length} Titik Evakuasi</span>
      </div>

      {/* Floating Pill: Titik Terdekat (jika GPS terdeteksi) */}
      {nearestPoint && (
        <div className="absolute top-3 left-3 z-1000 bg-amber-500/95 text-white backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md text-xs font-bold flex items-center gap-1.5 pointer-events-auto animate-fade-in">
          <Sparkles size={14} className="animate-spin-slow" />
          <span>
            Terdekat: {nearestPoint.name} (±{nearestPoint.distanceLabel})
          </span>
        </div>
      )}

      {/* Indikator Proteksi Zoom (klik 1x untuk zoom) - Pojok Kanan Atas */}
      {!isZoomActive && (
        <div className="absolute top-3 right-3 z-1000 bg-slate-900/80 text-white text-[11px] px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1.5 opacity-85 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn size={12} className="text-amber-400" />
          <span>Klik peta untuk mengaktifkan zoom</span>
        </div>
      )}
    </div>
  );
};
