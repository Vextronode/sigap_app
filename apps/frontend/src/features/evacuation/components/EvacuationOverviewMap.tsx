import React, { useMemo, useState, useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { MapPin, Navigation, ShieldCheck, Mountain, ZoomIn, Layers, Map as MapIcon } from "lucide-react";
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
  const [mapType, setMapType] = useState<"streets" | "satellite">("streets");

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
        {mapType === "streets" ? (
          <TileLayer
            key="google-streets"
            attribution='&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a>'
            url="https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={["0", "1", "2", "3"]}
            maxZoom={20}
          />
        ) : (
          <TileLayer
            key="google-satellite"
            attribution='&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a>'
            url="https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            subdomains={["0", "1", "2", "3"]}
            maxZoom={20}
          />
        )}

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
              <Popup
                className="sigap-map-popup"
                minWidth={175}
                maxWidth={215}
                autoPan={true}
                autoPanPadding={[12, 12]}
              >
                <div
                  className="p-0.5 space-y-1.5 text-left font-sans"
                  style={{ fontFamily: "inherit" }}
                >
                  <div className="flex items-center gap-1 flex-wrap">
                    {point.isCore && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-[#00247D]">
                        <ShieldCheck size={10} /> Utama
                      </span>
                    )}
                    {point.elevation && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <Mountain size={10} /> {point.elevation} m
                      </span>
                    )}
                  </div>

                  <strong className="block text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {point.name}
                  </strong>

                  {point.address && (
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      {point.address}
                    </p>
                  )}

                  {point.capacity && (
                    <div className="text-[10px] text-slate-600 font-medium">
                      Kapasitas: <span className="font-bold text-slate-800">{point.capacity.toLocaleString()} Jiwa</span>
                    </div>
                  )}

                  {/* Tombol Buka Rute Google Maps di Pop Up (Kompak & Ramping) */}
                  <div className="pt-1">
                    <a
                      href={googleMapsDirUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#ffffff" }}
                      className="group inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-2 bg-[#00247D] hover:bg-[#001D66] !text-white rounded-lg text-[10.5px] font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <span className="!text-white font-bold">Buka Rute Maps</span>
                      <Navigation
                        size={11}
                        className="!text-white shrink-0 group-hover:translate-x-0.5 transition-transform"
                      />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Kontrol Pilihan Mode Peta: Jalan / Satelit - Pojok Kanan Atas Super Ringkas (~70%) */}
      <div className="absolute top-2 right-2 z-1000 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-0.5 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-0.5 select-none pointer-events-auto">
        <button
          type="button"
          onClick={() => setMapType("streets")}
          className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
            mapType === "streets"
              ? "bg-[#00247D] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title="Tampilan Peta Jalan Google Maps (Kontras Jelas)"
        >
          <MapIcon size={10} />
          <span>Jalan</span>
        </button>
        <button
          type="button"
          onClick={() => setMapType("satellite")}
          className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
            mapType === "satellite"
              ? "bg-[#00247D] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title="Tampilan Foto Citra Satelit Bumi Nyata"
        >
          <Layers size={10} />
          <span>Satelit</span>
        </button>
      </div>

      {/* Indikator Status Zoom Interaktif - Di bawah tombol zoom Leaflet */}
      {!isZoomActive && (
        <div className="absolute top-[76px] left-2.5 z-1000 bg-slate-900/85 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] text-white/90 shadow-sm flex items-center gap-1 pointer-events-none transition-opacity">
          <ZoomIn size={11} className="text-amber-400" />
          <span>Klik aktifkan zoom</span>
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
