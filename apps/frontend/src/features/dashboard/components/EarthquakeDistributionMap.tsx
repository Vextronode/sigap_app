import React, { useMemo, useState, useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { TbCurrentLocation } from "react-icons/tb";
import { IoIosTimer } from "react-icons/io";
import { VscArrowSwap } from "react-icons/vsc";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ExternalLink,
  Layers,
  MapPin,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Radio,
} from "lucide-react";
import { useEarthquakeMapPoints } from "../hooks/useEarthquakeMapPoints";
import { formatDateTime, getDaysAgoInfo } from "../../../utils/date";
import type { Earthquake } from "../../../types/dashboard";
import { Skeleton } from "../../../components/ui/Skeleton";

// Titik tengah default kepulauan Jawa / Indonesia bagian barat
const DEFAULT_MAP_CENTER: [number, number] = [-7.6838, 108.561]; // Koordinat Desa Cibenda / Jawa Barat
const DEFAULT_MAP_ZOOM = 6;

// Pengatur kontrol zoom & klik interaktif agar tidak menjebak scroll jari di HP
const MapInteractionController: React.FC<{
  isInteractive: boolean;
  onActivate: () => void;
  resetTrigger: number;
  points: Earthquake[];
}> = ({ isInteractive, onActivate, resetTrigger, points }) => {
  const map = useMap();

  useEffect(() => {
    // Bersihkan zoom control bawaan Leaflet jika ada
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

  useEffect(() => {
    if (resetTrigger > 0) {
      if (points.length > 0) {
        const validCoords = points
          .filter(
            (p) =>
              p.coordinates &&
              Number.isFinite(p.coordinates.latitude) &&
              Number.isFinite(p.coordinates.longitude)
          )
          .map((p) => [p.coordinates!.latitude, p.coordinates!.longitude] as [number, number]);

        if (validCoords.length > 0) {
          const bounds = L.latLngBounds(validCoords);
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
          return;
        }
      }
      map.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
    }
  }, [resetTrigger, map, points]);

  useMapEvents({
    click() {
      onActivate();
    },
  });

  return null;
};

// Komponen tombol zoom dan navigasi kustom
const CustomMapControls: React.FC<{
  onReset: () => void;
  mapType: "streets" | "satellite";
  onToggleMapType: () => void;
}> = ({ onReset, mapType, onToggleMapType }) => {
  const map = useMap();

  return (
    <div className="absolute bottom-10 right-4 z-[400] flex flex-col gap-1.5 select-none pointer-events-auto">
      <div className="flex flex-col rounded-xl overflow-hidden shadow-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          aria-label="Perbesar peta"
          title="Perbesar peta"
          className="p-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800"
        >
          <ZoomIn size={18} />
        </button>
        <button
          type="button"
          onClick={() => map.zoomOut()}
          aria-label="Perkecil peta"
          title="Perkecil peta"
          className="p-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ZoomOut size={18} />
        </button>
      </div>

      <button
        type="button"
        onClick={onReset}
        aria-label="Pusatkan kembali tampilan peta"
        title="Pusatkan kembali tampilan peta"
        className="p-2.5 rounded-xl shadow-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <RotateCcw size={18} />
      </button>

      <button
        type="button"
        onClick={onToggleMapType}
        aria-label="Ganti mode peta satelit atau jalan"
        title={`Ganti ke mode ${mapType === "streets" ? "Satelit" : "Jalan"}`}
        className="p-2.5 rounded-xl shadow-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Layers size={18} />
      </button>
    </div>
  );
};

// Cache modul untuk divIcon titik gempa agar tidak dibuat ulang berulang kali
const earthquakeIconCache = new Map<string, L.DivIcon>();

export const EarthquakeDistributionMap: React.FC = () => {
  const { data: earthquakes = [], isLoading, isError } = useEarthquakeMapPoints();
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [mapType, setMapType] = useState<"streets" | "satellite">("streets");
  const [resetTrigger, setResetTrigger] = useState(0);

  // Saring gempa yang memiliki koordinat valid di kawasan Indonesia & palung tektonik sekitarnya
  const validEarthquakes = useMemo(() => {
    return earthquakes.filter(
      (eq) =>
        eq.coordinates &&
        Number.isFinite(eq.coordinates.latitude) &&
        Number.isFinite(eq.coordinates.longitude) &&
        eq.coordinates.latitude >= -15 &&
        eq.coordinates.latitude <= 10 &&
        eq.coordinates.longitude >= 90 &&
        eq.coordinates.longitude <= 145
    );
  }, [earthquakes]);

  const getEarthquakeIcon = (magnitude: number, isToday: boolean): L.DivIcon => {
    const formattedMag = Number.isFinite(magnitude) ? magnitude.toFixed(1) : "0.0";
    const key = `${formattedMag}-${isToday}`;
    const existing = earthquakeIconCache.get(key);
    if (existing) return existing;

    const svgIcon = renderToStaticMarkup(
      <TbCurrentLocation
        size={18}
        color="#ffffff"
        style={{ display: "block" }}
      />
    );

    const icon = L.divIcon({
      className: `overview-map-pin leaflet-interactive earthquake-map-pin ${
        isToday ? "has-pulse is-today" : ""
      }`,
      html: `
        ${isToday ? '<div class="pin-pulse"></div>' : ""}
        <div class="pin-circle">
          ${svgIcon}
        </div>
        <div class="earthquake-mag-label">M ${formattedMag}</div>
      `,
      iconSize: [42, 54],
      iconAnchor: [21, 16],
      popupAnchor: [0, -18],
    });

    earthquakeIconCache.set(key, icon);
    return icon;
  };

  if (isLoading && validEarthquakes.length === 0) {
    return (
      <section
        id="earthquake-map"
        aria-label="Peta Sebaran Gempa Bumi"
        className="w-full mb-6"
      >
        <div className="relative w-full h-[460px] sm:h-[500px] rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 flex flex-col items-center justify-center gap-3">
          <Skeleton className="w-full h-full absolute inset-0 !rounded-none" />
          <div className="relative z-10 flex flex-col items-center gap-2 text-slate-500">
            <Radio size={28} className="animate-spin text-blue-600" />
            <span className="text-xs font-semibold">
              Memuat Peta Sebaran Gempa BMKG...
            </span>
          </div>
        </div>
      </section>
    );
  }

  if (isError && validEarthquakes.length === 0) {
    return null; // Graceful fallback
  }

  return (
    <section
      id="earthquake-map"
      aria-label="Peta Sebaran Gempa Bumi"
      className="w-full mb-6"
    >
      <div
        className="relative w-full h-[440px] sm:h-[490px] lg:h-[520px] rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm z-0 [&_.leaflet-top_.leaflet-control-zoom]:!hidden"
        onMouseLeave={() => setIsZoomActive(false)}
      >
        {/* Floating Top Badge Info */}
        <div className="absolute top-3.5 left-3.5 z-[400] flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
            </span>
            <span className="text-xs font-bold tracking-tight">
              Peta Sebaran Gempa BMKG
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-2">
              {validEarthquakes.length} Titik
            </span>
          </div>
        </div>

        <MapContainer
          center={DEFAULT_MAP_CENTER}
          zoom={DEFAULT_MAP_ZOOM}
          zoomControl={false}
          scrollWheelZoom={false}
          touchZoom={true}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          {mapType === "streets" ? (
            <TileLayer
              key="google-streets"
              attribution='&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a> | Data BMKG'
              url="https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              subdomains={["0", "1", "2", "3"]}
              maxZoom={18}
            />
          ) : (
            <TileLayer
              key="google-satellite"
              attribution='&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a> | Data BMKG'
              url="https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              subdomains={["0", "1", "2", "3"]}
              maxZoom={18}
            />
          )}

          <MapInteractionController
            isInteractive={isZoomActive}
            onActivate={() => setIsZoomActive(true)}
            resetTrigger={resetTrigger}
            points={validEarthquakes}
          />

          <CustomMapControls
            onReset={() => setResetTrigger((prev) => prev + 1)}
            mapType={mapType}
            onToggleMapType={() =>
              setMapType((prev) => (prev === "streets" ? "satellite" : "streets"))
            }
          />

          {/* Render Tiap Titik Gempa */}
          {validEarthquakes.map((quake) => {
            if (!quake.coordinates) return null;
            const daysAgoInfo = getDaysAgoInfo(quake.updatedAt);
            const isToday = daysAgoInfo?.tone === "today";
            const dt = formatDateTime(quake.updatedAt);

            return (
              <Marker
                key={`${quake.updatedAt}-${quake.coordinates.latitude}-${quake.coordinates.longitude}`}
                position={[quake.coordinates.latitude, quake.coordinates.longitude]}
                icon={getEarthquakeIcon(quake.magnitude, isToday)}
              >
                <Popup
                  className="earthquake-map-popup"
                  minWidth={285}
                  maxWidth={340}
                  autoPan={true}
                  autoPanPadding={[16, 16]}
                >
                  <div
                    className="p-3.5 sm:p-4 space-y-2.5 text-left font-sans"
                    style={{ fontFamily: "inherit" }}
                  >
                    {/* Header: Logo BMKG + Teks Detail + Tag Hari Relatif */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <img
                          src="/assets/image/logo-bmkg.webp"
                          alt="Logo BMKG"
                          className="h-5.5 w-auto object-contain shrink-0"
                        />
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                          Detail Gempa Bumi:
                        </span>
                      </div>

                      {daysAgoInfo && (
                        <span
                          className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            daysAgoInfo.tone === "today"
                              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                              : daysAgoInfo.tone === "recent"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                              : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          }`}
                        >
                          {daysAgoInfo.text}
                        </span>
                      )}
                    </div>

                    {/* Judul Wilayah / Lokasi Gempa */}
                    <div>
                      <strong className="block text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {quake.location}
                      </strong>
                    </div>

                    {/* Badge Metrik: Magnitudo Merah SIGAP & Kedalaman */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 font-extrabold text-xs border border-rose-200/80 dark:border-rose-900/60 shadow-2xs">
                        M {quake.magnitude.toFixed(1)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200/60 dark:border-slate-700/60">
                        Kedalaman: {quake.depth}
                      </span>
                    </div>

                    {/* Kartu Khusus Waktu Kejadian (Atas) & Jarak ke Desa Cibenda (Bawah) */}
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-2.5 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 text-[11.5px] text-slate-700 dark:text-slate-200">
                        <IoIosTimer
                          size={16}
                          className="text-[#00247D] dark:text-blue-400 shrink-0"
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {dt.date} • {dt.time}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 border-t border-slate-200/60 dark:border-slate-700/60 pt-1.5">
                        <VscArrowSwap
                          size={15}
                          className="text-[#00247D] dark:text-blue-400 shrink-0"
                        />
                        <span>
                          <strong className="text-slate-900 dark:text-white font-extrabold text-[12.5px]">
                            ±{Math.round(quake.distanceToVillage)} KM
                          </strong>{" "}
                          dari Desa Cibenda
                        </span>
                      </div>
                    </div>

                    {/* Tautan Shakemap dengan Teks Biru SIGAP atau Exception Button jika Tidak Tersedia */}
                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                      {quake.shakemap ? (
                        <a
                          href={quake.shakemap}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center justify-between w-full px-3 py-2 bg-blue-50/90 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/70 rounded-xl text-xs font-bold transition-all border border-blue-200/80 dark:border-blue-900/60 cursor-pointer shadow-2xs"
                          title="Buka gambar shakemap ukuran penuh di tab baru"
                        >
                          <span className="flex items-center gap-2 text-[#00247D] dark:text-[#7da2ff] font-bold">
                            <MapPin size={15} className="text-[#00247D] dark:text-[#7da2ff] shrink-0" />
                            Lihat Peta Shakemap BMKG
                          </span>
                          <ExternalLink
                            size={13}
                            className="text-[#00247D] dark:text-[#7da2ff] shrink-0 group-hover:translate-x-0.5 transition-transform"
                          />
                        </a>
                      ) : (
                        <div
                          className="inline-flex items-center justify-between w-full px-3 py-2 bg-slate-100/90 dark:bg-slate-800/80 rounded-xl text-xs font-medium text-slate-400 dark:text-slate-500 border border-slate-200/80 dark:border-slate-700/80 cursor-not-allowed select-none"
                          title="Gambar ShakeMap BMKG tidak tersedia untuk data gempa ini"
                        >
                          <span className="flex items-center gap-2">
                            <MapPin size={15} className="text-slate-400 dark:text-slate-500 shrink-0" />
                            Gambar ShakeMap BMKG Tidak Tersedia
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </section>
  );
};

