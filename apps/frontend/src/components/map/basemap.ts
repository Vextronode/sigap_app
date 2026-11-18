/**
 * Peta dasar self-host (PMTiles, data OpenStreetMap) yang disajikan SIGAP di /maps/.
 * File dan versinya dibaca dari /maps/manifest.json hasil scripts/maps/build-basemap.sh.
 */

/** Nama cache peta dasar; dipakai juga oleh route di service worker (src/sw.js). */
export const BASEMAP_CACHE = "sigap-basemap";

const MANIFEST_URL = "/maps/manifest.json";

export interface BasemapLayer {
  name: "indonesia" | "pangandaran";
  file: string;
  /** [minLon, minLat, maxLon, maxLat] */
  bbox: [number, number, number, number];
  maxzoom: number;
  bytes: number;
  sha256: string;
}

export interface BasemapManifest {
  version: string;
  layers: BasemapLayer[];
}

/** Batas geser peta evakuasi: wilayah detail Kabupaten Pangandaran. */
export const PANGANDARAN_BOUNDS: [[number, number], [number, number]] = [
  [-7.9, 108.3],
  [-7.45, 108.9],
];

export const BASEMAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &middot; <a href="https://protomaps.com" target="_blank" rel="noopener noreferrer">Protomaps</a>';

export const basemapUrl = (layer: BasemapLayer) => `/maps/${layer.file}`;

/** API key ArcGIS Location Platform untuk lapisan satelit; tanpa key, satelit tidak tersedia. */
export const ESRI_API_KEY: string = import.meta.env.VITE_ESRI_API_KEY ?? "";

export const SATELLITE_TILE_URL =
  "https://static-map-tiles-api.arcgis.com/arcgis/rest/services/static-basemap-tiles-service/v1/arcgis/imagery/static/tile/{z}/{y}/{x}";

export const SATELLITE_ATTRIBUTION =
  'Powered by <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a> &middot; Citra &copy; Esri dan penyedia datanya';

/**
 * Prototipe Fase 0: zoom maksimum data detail Pangandaran yang dipakai (14 bawaan,
 * `?peta=z15` untuk membandingkan). Hanya varian ini yang disimpan untuk offline.
 */
const selectedDetailZoom = (): number => {
  const param = new URLSearchParams(window.location.search).get("peta");
  return param === "z15" ? 15 : 14;
};

/** Lapisan detail Pangandaran yang dipakai; null bila manifest tidak memuatnya. */
export const detailLayerOf = (manifest: BasemapManifest): BasemapLayer | null => {
  const variants = manifest.layers.filter((layer) => layer.name === "pangandaran");
  return variants.find((layer) => layer.maxzoom === selectedDetailZoom()) ?? variants[0] ?? null;
};

let manifestRequest: Promise<BasemapManifest | null> | null = null;

/** Manifest dibaca sekali per halaman; null bila tidak tersedia (mis. offline tanpa cache). */
export const loadBasemapManifest = (): Promise<BasemapManifest | null> => {
  manifestRequest ??= fetch(MANIFEST_URL)
    .then((response) => (response.ok ? (response.json() as Promise<BasemapManifest>) : null))
    .catch(() => null);
  return manifestRequest;
};

/** Mode hemat data (Chrome Android); browser lain tidak menyediakan informasi ini. */
const isSaveDataEnabled = (): boolean =>
  Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

/**
 * Menyimpan file detail Pangandaran versi terbaru secara utuh di cache agar peta evakuasi
 * tampil saat offline, lalu menghapus file lain (versi lama atau varian lain). Lapisan
 * Indonesia tidak disimpan; peta gempa memuatnya online. Permintaan potongan (range)
 * dari protomaps-leaflet kemudian dilayani service worker dari salinan utuh ini.
 */
export const cacheBasemapForOffline = async (): Promise<void> => {
  if (typeof caches === "undefined" || isSaveDataEnabled()) return;
  const manifest = await loadBasemapManifest();
  const detail = manifest ? detailLayerOf(manifest) : null;
  if (!detail) return;

  const cache = await caches.open(BASEMAP_CACHE);
  const wanted = new Set([basemapUrl(detail)]);

  for (const request of await cache.keys()) {
    const path = new URL(request.url).pathname;
    if (path.endsWith(".pmtiles") && !wanted.has(path)) {
      await cache.delete(request);
    }
  }

  for (const url of wanted) {
    if (!(await cache.match(url))) {
      await cache.add(url);
    }
  }
};
