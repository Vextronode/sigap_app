import { useState, useMemo, useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { Navigation, Crosshair, MapPin, Layers, Map as MapIcon } from "lucide-react";
import { CIBENDA_CENTER } from "../../../utils/map";

type EvacuationLocationPickerProps = {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
  isCore?: boolean;
};

// Komponen penangkap klik peta
const LocationEvents = ({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      onLocationSelect(
        Number(e.latlng.lat.toFixed(6)),
        Number(e.latlng.lng.toFixed(6))
      );
    },
  });
  return null;
};

// Pengontrol fokus peta (pan to location)
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 0.8 });
  }, [center, map]);
  return null;
};

export const EvacuationLocationPicker = ({
  latitude,
  longitude,
  onChange,
  isCore = false,
}: EvacuationLocationPickerProps) => {
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<"streets" | "satellite">("streets");

  const markerPosition = useMemo<[number, number]>(() => {
    const validLat = typeof latitude === "number" && !isNaN(latitude) ? latitude : CIBENDA_CENTER[0];
    const validLng = typeof longitude === "number" && !isNaN(longitude) ? longitude : CIBENDA_CENTER[1];
    return [validLat, validLng];
  }, [latitude, longitude]);

  const customPinIcon = useMemo(() => {
    const primaryColor = isCore ? "#00247D" : "#0284C7";
    return L.divIcon({
      className: "evacuation-pin-picker",
      html: `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          background-color: ${primaryColor};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
          border: 2.5px solid #ffffff;
          transition: transform 0.15s ease;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background-color: #ffffff;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
    });
  }, [isCore]);

  // Handler geser marker (drag)
  const handleMarkerDragEnd = (e: L.DragEndEvent) => {
    const marker = e.target;
    if (marker) {
      const { lat, lng } = marker.getLatLng();
      onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
    }
  };

  // Deteksi lokasi fisik saat ini (HTML5 Geolocation)
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Browser Anda tidak mendukung deteksi lokasi GPS.");
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        onChange(lat, lng);
      },
      (err) => {
        setIsLocating(false);
        setGpsError(
          err.code === 1
            ? "Izin akses lokasi ditolak di peramban Anda."
            : "Gagal mendeteksi lokasi GPS perangkat."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Kembalikan ke koordinat pusat Desa Cibenda
  const handleResetToCibenda = () => {
    onChange(CIBENDA_CENTER[0], CIBENDA_CENTER[1]);
    setGpsError(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
          <MapPin size={14} className="text-[#00247D] dark:text-blue-400" />
          Klik peta atau geser pin marker ke titik shelter:
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#00247D] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Navigation size={12} className={isLocating ? "animate-spin" : ""} />
            {isLocating ? "Mencari GPS..." : "Gunakan Lokasi Saya"}
          </button>
          <button
            type="button"
            onClick={handleResetToCibenda}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Crosshair size={12} />
            Pusat Cibenda
          </button>
        </div>
      </div>

      {gpsError && (
        <div className="text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200/60 dark:border-rose-800/40">
          {gpsError}
        </div>
      )}

      {/* Kontainer Peta Leaflet Picker */}
      <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner z-0">
        <MapContainer
          center={markerPosition}
          zoom={15}
          scrollWheelZoom={true}
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
          <MapController center={markerPosition} />
          <LocationEvents onLocationSelect={onChange} />
          <Marker
            position={markerPosition}
            icon={customPinIcon}
            draggable={true}
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
          />
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
            title="Tampilan Peta Jalan Google Maps"
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

        {/* Badge Koordinat Live di Pojok Bawah Peta */}
        <div className="absolute bottom-2 left-2 z-[400] bg-slate-900/85 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-lg shadow-md font-mono flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
          </span>
        </div>
      </div>
    </div>
  );
};
