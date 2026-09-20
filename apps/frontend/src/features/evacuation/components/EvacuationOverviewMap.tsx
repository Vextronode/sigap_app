import React, { useMemo, useState, useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { MapPin, Navigation, ShieldCheck, Mountain, ZoomIn } from "lucide-react";
import type { EvacuationPoint } from "../../../types/dashboard";
import { CIBENDA_CENTER } from "../../../utils/map";

interface EvacuationOverviewMapProps {
  points: EvacuationPoint[];
  selectedPointId?: string | null;
  onSelectPoint?: (point: EvacuationPoint) => void;
}

// Komponen pengatur interaksi zoom (aktif hanya setelah diklik sekali)
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

export const EvacuationOverviewMap: React.FC<EvacuationOverviewMapProps> = ({
  points,
  selectedPointId,
  onSelectPoint,
}) => {
  const [isZoomActive, setIsZoomActive] = useState(false);

  const defaultCenter = useMemo<[number, number]>(() => {
    if (points.length > 0) {
      return [points[0].latitude, points[0].longitude];
    }
    return CIBENDA_CENTER;
  }, [points]);

  const createMarkerIcon = (point: EvacuationPoint) => {
    const isSelected = selectedPointId === point.id;
    const isCore = point.isCore;
    const bgColor = isSelected ? "#F59E0B" : isCore ? "#00247D" : "#0D9488";

    return L.divIcon({
      className: "overview-map-pin",
      html: `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${isSelected ? "38px" : "32px"};
          height: ${isSelected ? "38px" : "32px"};
          background-color: ${bgColor};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          border: 2px solid #ffffff;
          transition: all 0.2s ease;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: #ffffff;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: isSelected ? [38, 38] : [32, 32],
      iconAnchor: isSelected ? [19, 38] : [16, 32],
      popupAnchor: [0, isSelected ? -38 : -32],
    });
  };

  return (
    <div
      className="relative w-full h-[440px] sm:h-[430px] rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xs z-0"
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

        {points.map((point) => {
          const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}&travelmode=walking`;

          return (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={createMarkerIcon(point)}
              eventHandlers={{
                click: () => onSelectPoint?.(point),
              }}
            >
              <Popup className="sigap-map-popup">
                <div
                  className="p-1 space-y-2.5 text-left min-w-[220px] font-sans"
                  style={{ fontFamily: "inherit" }}
                >
                  <div className="flex items-center gap-1.5">
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

                  {/* Tombol Buka Rute Google Maps di Pop Up (Teks putih tebal, ikon panah di kanan dengan hover effect) */}
                  <div className="pt-2 border-t border-slate-100">
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

      {/* Indikator Status Zoom Interaktif */}
      {!isZoomActive && (
        <div className="absolute top-3 right-3 z-[400] bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] text-white/90 shadow-sm flex items-center gap-1.5 pointer-events-none transition-opacity">
          <ZoomIn size={12} className="text-amber-400" />
          <span>Klik peta untuk mengaktifkan zoom 2 jari</span>
        </div>
      )}

      {/* Tag Peta Sebaran Dipindahkan ke Ujung Kiri Bawah agar tidak menimpa copyright OpenStreetMap */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-2 pointer-events-none">
        <MapPin size={13} className="text-[#00247D] dark:text-blue-400" />
        <span>Peta Sebaran {points.length} Titik Evakuasi Desa Cibenda</span>
      </div>
    </div>
  );
};
