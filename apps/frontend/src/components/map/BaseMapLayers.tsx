import { useEffect, useState } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { leafletLayer } from "protomaps-leaflet";
import { useUiStore } from "../../stores/uiStore";
import {
  BASEMAP_ATTRIBUTION,
  basemapUrl,
  loadBasemapManifest,
  type BasemapManifest,
} from "./basemap";

interface BaseMapLayersProps {
  /**
   * `national`: lapisan Indonesia (zoom rendah) di bawah lapisan detail Pangandaran, untuk
   * peta gempa. `pangandaran`: hanya lapisan detail, untuk peta yang dibatasi ke
   * PANGANDARAN_BOUNDS (peta evakuasi).
   */
  coverage?: "national" | "pangandaran";
}

/**
 * Peta dasar self-host untuk MapContainer react-leaflet. Peta digambar di browser dari
 * file PMTiles milik SIGAP, tanpa request ke penyedia tile pihak ketiga. Gaya mengikuti
 * tema terang/gelap.
 */
export const BaseMapLayers = ({ coverage = "national" }: BaseMapLayersProps) => {
  const map = useMap();
  const theme = useUiStore((state) => state.theme);
  const [manifest, setManifest] = useState<BasemapManifest | null>(null);

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
    const flavor = theme === "dark" ? "dark" : "light";

    const selected = manifest.layers.filter(
      (layer) => coverage === "national" || layer.name === "pangandaran"
    );
    const layers = selected.map((layer, index) => {
      const [minLon, minLat, maxLon, maxLat] = layer.bbox;
      const isDetail = layer.name !== "indonesia";
      return leafletLayer({
        url: basemapUrl(layer),
        flavor,
        lang: "id",
        maxDataZoom: layer.maxzoom,
        noWrap: true,
        bounds: isDetail ? L.latLngBounds([minLat, minLon], [maxLat, maxLon]) : undefined,
        attribution: index === 0 ? BASEMAP_ATTRIBUTION : undefined,
      }) as unknown as L.GridLayer;
    });

    layers.forEach((layer) => layer.addTo(map));
    return () => {
      layers.forEach((layer) => map.removeLayer(layer));
    };
  }, [manifest, theme, map, coverage]);

  return null;
};
