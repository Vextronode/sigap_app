import React, { useMemo, useState, useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, ZoomControl, useMap, useMapEvents } from "react-leaflet";
import { MapPin, Navigation, ShieldCheck, Mountain, ZoomIn } from "lucide-react";
import type { EvacuationPoint } from "../../../types/dashboard";
import { CIBENDA_CENTER } from "../../../utils/map";
import { SIGAP_THEME } from "../../../constants/theme";
import { BaseMapLayers } from "../../../components/map/BaseMapLayers";
import { PANGANDARAN_BOUNDS } from "../../../components/map/basemap";
import { MapTypeToggle } from "../../../components/map/MapTypeToggle";
import { SATELLITE_AVAILABLE, useBaseMapMode } from "../../../components/map/useBaseMapMode";
import { useTouchDragLock } from "../../../components/map/useTouchDragLock";

interface EvacuationOverviewMapProps {
  points: EvacuationPoint[];
  selectedPointId?: string | null;
  onSelectPoint?: (point: EvacuationPoint) => void;
}

// Komponen pengatur interaksi zoom (aktif hanya setelah diklik sekali)
const MapZoomController = ({
  isInteractive,
  onActivate,
  onDeactivate,
}: {
  isInteractive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) => {
  const map = useMap();
  useTouchDragLock(isInteractive, onDeactivate);

  useEffect(() => {
    // Pastikan zoom control bawaan di bagian atas dibersihkan agar tidak terduplikasi
    if (map.zoomControl) {
      try {
        map.removeControl(map.zoomControl);
      } catch {
        // ignore
      }
    }
    const container = map.getContainer();
    const topZooms = container.querySelectorAll(".leaflet-top .leaflet-control-zoom");
    topZooms.forEach((el) => el.remove());
  }, [map]);

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
  const { mapType, setMapType, isOnline, satelliteUsable, onSatelliteError } = useBaseMapMode();

  const defaultCenter = useMemo<[number, number]>(() => {
    if (points.length > 0) {
      return [points[0].latitude, points[0].longitude];
    }
    return CIBENDA_CENTER;
  }, [points]);

  const createMarkerIcon = (point: EvacuationPoint) => {
    const isSelected = selectedPointId === point.id;
    const isCore = point.isCore;
    const bgColor = isSelected ? "#F59E0B" : isCore ? SIGAP_THEME.primary : "#0D9488";

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
      className="relative w-full h-[440px] sm:h-[430px] rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xs z-0 [&_.leaflet-top_.leaflet-control-zoom]:!hidden"
      onMouseLeave={() => setIsZoomActive(false)}
    >
      <MapContainer
        center={defaultCenter}
        zoom={14}
        zoomControl={false}
        scrollWheelZoom={false}
        touchZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        maxBounds={PANGANDARAN_BOUNDS}
        maxBoundsViscosity={1}
        minZoom={11}
        maxZoom={18}
      >
        <ZoomControl position="bottomleft" />
        <BaseMapLayers coverage="pangandaran" mode={mapType} onSatelliteError={onSatelliteError} />

        <MapZoomController
          isInteractive={isZoomActive}
          onActivate={() => setIsZoomActive(true)}
          onDeactivate={() => setIsZoomActive(false)}
        />

        {points.map((point) => {
          // SEC-14: Sanitasi koordinat navigasi Google Maps dengan encodeURIComponent
          const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(point.latitude)},${encodeURIComponent(point.longitude)}&travelmode=walking`;

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
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sigap-primary-light text-sigap-primary">
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
                      className="group inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-2 bg-sigap-primary hover:bg-sigap-primary-hover !text-white rounded-lg text-[10.5px] font-bold transition-all shadow-xs cursor-pointer"
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

      {/* Kontrol Pilihan Mode Peta: Jalan / Satelit (tampil bila satelit tersedia) */}

      <MapTypeToggle
        value={mapType}
        onChange={setMapType}
        isOnline={isOnline}
        satelliteUsable={satelliteUsable}
      />

      {/* Indikator Status Zoom Interaktif - Di bawah tag Jalan/Satelit di Kanan Atas */}
      {!isZoomActive && (
        <div className={`absolute ${SATELLITE_AVAILABLE ? "top-[46px]" : "top-2"} right-2 z-1000 bg-slate-900/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm flex items-center gap-1.5 pointer-events-none opacity-90 transition-opacity`}>
          <ZoomIn size={12} className="text-amber-400 shrink-0" />
          <span>Klik aktifkan zoom</span>
        </div>
      )}

      {/* Tag Total / Sebaran Titik Evakuasi - Pojok Kiri Atas */}
      <div className="absolute top-2.5 left-2.5 z-1000 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 shadow-xs flex items-center gap-1.5 pointer-events-none">
        <MapPin size={13} className="text-sigap-primary dark:text-blue-400" />
        <span>Total {points.length} Titik Evakuasi</span>
      </div>
    </div>
  );
};
