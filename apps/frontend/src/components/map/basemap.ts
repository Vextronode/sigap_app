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

let manifestRequest: Promise<BasemapManifest | null> | null = null;

/** Manifest dibaca sekali per halaman; null bila tidak tersedia (mis. offline tanpa cache). */
export const loadBasemapManifest = (): Promise<BasemapManifest | null> => {
  manifestRequest ??= fetch(MANIFEST_URL)
    .then((response) => (response.ok ? (response.json() as Promise<BasemapManifest>) : null))
    .catch(() => null);
  return manifestRequest;
};

/**
 * Menyimpan file peta versi terbaru secara utuh di cache agar peta tampil saat offline,
 * lalu menghapus file versi lama. Permintaan potongan (range) dari protomaps-leaflet
 * kemudian dilayani service worker dari salinan utuh ini.
 */
export const cacheBasemapForOffline = async (): Promise<void> => {
  if (typeof caches === "undefined") return;
  const manifest = await loadBasemapManifest();
  if (!manifest) return;

  const cache = await caches.open(BASEMAP_CACHE);
  const wanted = new Set(manifest.layers.map(basemapUrl));

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
