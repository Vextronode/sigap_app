import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { labelRules, leafletLayer, paintRules } from "protomaps-leaflet";
import { useUiStore } from "../../stores/uiStore";
import {
  BASEMAP_ATTRIBUTION,
  ESRI_API_KEY,
  SATELLITE_ATTRIBUTION,
  SATELLITE_TILE_URL,
  basemapUrl,
  detailLayerOf,
  loadBasemapManifest,
  type BasemapLayer,
  type BasemapManifest,
} from "./basemap";
import { sigapFlavor } from "./mapStyle";

export type BaseMapMode = "streets" | "satellite";

interface BaseMapLayersProps {
  /**
   * `national`: lapisan Indonesia (zoom rendah) di bawah lapisan detail Pangandaran, untuk
   * peta gempa. `pangandaran`: hanya lapisan detail, untuk peta yang dibatasi ke
   * PANGANDARAN_BOUNDS (peta evakuasi).
   */
  coverage?: "national" | "pangandaran";
  /**
   * `satellite`: citra Esri (online) dengan label nama tempat dari peta SIGAP di atasnya.
   * Diabaikan bila VITE_ESRI_API_KEY kosong.
   */
  mode?: BaseMapMode;
  /** Dipanggil bila tile satelit gagal dimuat dan belum ada yang berhasil. */
  onSatelliteError?: () => void;
}

/** Batas zoom lapisan Indonesia (data zoom 0-8); detail Pangandaran dipakai mulai zoom 9. */
const NATIONAL_MAX_ZOOM = 8;

/** Jumlah tile satelit gagal (tanpa satu pun berhasil) sebelum kembali ke peta jalan. */
const SATELLITE_FAILURE_LIMIT = 3;

const boundsOf = (layer: BasemapLayer) => {
  const [minLon, minLat, maxLon, maxLat] = layer.bbox;
  return L.latLngBounds([minLat, minLon], [maxLat, maxLon]);
};

/**
 * Peta dasar untuk MapContainer react-leaflet. Peta jalan digambar di browser dari file
 * PMTiles milik SIGAP (data OpenStreetMap) dengan gaya SIGAP, tanpa request ke penyedia
 * tile pihak ketiga. Mode satelit memakai citra Esri resmi (API key) saat online.
 */
export const BaseMapLayers = ({
  coverage = "national",
  mode = "streets",
  onSatelliteError,
}: BaseMapLayersProps) => {
  const map = useMap();
  const onSatelliteErrorRef = useRef(onSatelliteError);
  useEffect(() => {
    onSatelliteErrorRef.current = onSatelliteError;
  }, [onSatelliteError]);
  const theme = useUiStore((state) => state.theme);
  const [manifest, setManifest] = useState<BasemapManifest | null>(null);
  const satellite = mode === "satellite" && ESRI_API_KEY !== "";

  useEffect(() => {
    let active = true;
    loadBasemapManifest().then((loaded) => {
      if (active) setManifest(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!manifest) return;
    const flavor = sigapFlavor(theme);
    const detail = detailLayerOf(manifest);
    const indonesia = manifest.layers.find((layer) => layer.name === "indonesia");
    const sources = [coverage === "national" ? indonesia : undefined, detail].filter(
      (layer): layer is BasemapLayer => Boolean(layer)
    );

    const layers: L.Layer[] = [];
    if (satellite) {
      const imagery = L.tileLayer(`${SATELLITE_TILE_URL}?token=${encodeURIComponent(ESRI_API_KEY)}`, {
        attribution: SATELLITE_ATTRIBUTION,
        maxZoom: 18,
      });
      // Kembali ke peta jalan bila citra tidak dapat dimuat sama sekali.
      let loaded = 0;
      let failed = 0;
      imagery.on("tileload", () => {
        loaded += 1;
      });
      imagery.on("tileerror", () => {
        failed += 1;
        if (loaded === 0 && failed === SATELLITE_FAILURE_LIMIT) onSatelliteErrorRef.current?.();
      });
      layers.push(imagery);
    }
    const national = sources.length > 1;
    sources.forEach((layer, index) => {
      const isIndonesia = layer.name === "indonesia";
      // Pada peta nasional, lapisan Indonesia dipakai sampai zoom 8 dan detail mulai zoom 9,
      // agar label tidak tergambar dua kali. Di mode jalan lapisan Indonesia tetap tampil di
      // atas zoom 8 sebagai latar di luar wilayah Pangandaran (tertutup lapisan detail).
      const zoomRange = !national
        ? {}
        : isIndonesia
          ? satellite
            ? { maxZoom: NATIONAL_MAX_ZOOM }
            : {}
          : { minZoom: NATIONAL_MAX_ZOOM + 1 };
      layers.push(
        leafletLayer({
          url: basemapUrl(layer),
          // Mode satelit hanya menggambar label di atas citra.
          paintRules: satellite ? [] : paintRules(flavor),
          labelRules: labelRules(flavor, "id"),
          backgroundColor: satellite ? "transparent" : flavor.background,
          maxDataZoom: layer.maxzoom,
          noWrap: true,
          bounds: isIndonesia ? undefined : boundsOf(layer),
          // String kosong mencegah protomaps-leaflet menambah atribusi bawaannya lagi.
          attribution: index === 0 ? BASEMAP_ATTRIBUTION : "",
          ...zoomRange,
        }) as unknown as L.GridLayer
      );
    });

    layers.forEach((layer) => layer.addTo(map));
    return () => {
      layers.forEach((layer) => map.removeLayer(layer));
    };
  }, [manifest, theme, map, coverage, satellite]);

  return null;
};
