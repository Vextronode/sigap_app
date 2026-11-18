import { useEffect, useState } from "react";
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
}

const boundsOf = (layer: BasemapLayer) => {
  const [minLon, minLat, maxLon, maxLat] = layer.bbox;
  return L.latLngBounds([minLat, minLon], [maxLat, maxLon]);
};

/**
 * Peta dasar untuk MapContainer react-leaflet. Peta jalan digambar di browser dari file
 * PMTiles milik SIGAP (data OpenStreetMap) dengan gaya SIGAP, tanpa request ke penyedia
 * tile pihak ketiga. Mode satelit memakai citra Esri resmi (API key) saat online.
 */
export const BaseMapLayers = ({ coverage = "national", mode = "streets" }: BaseMapLayersProps) => {
  const map = useMap();
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
      layers.push(
        L.tileLayer(`${SATELLITE_TILE_URL}?token=${encodeURIComponent(ESRI_API_KEY)}`, {
          attribution: SATELLITE_ATTRIBUTION,
          maxZoom: 18,
        })
      );
    }
    sources.forEach((layer, index) => {
      layers.push(
        leafletLayer({
          url: basemapUrl(layer),
          // Mode satelit hanya menggambar label di atas citra.
          paintRules: satellite ? [] : paintRules(flavor),
          labelRules: labelRules(flavor, "id"),
          backgroundColor: satellite ? "transparent" : flavor.background,
          maxDataZoom: layer.maxzoom,
          noWrap: true,
          bounds: layer.name === "indonesia" ? undefined : boundsOf(layer),
          attribution: index === 0 ? BASEMAP_ATTRIBUTION : undefined,
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
