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

/**
 * Citra satelit World Imagery (tile raster 256 px) dari layanan basemap ArcGIS Location
 * Platform; memerlukan API key dengan izin Basemaps. Static Basemap Tiles tidak dipakai
 * karena tidak menyediakan gaya citra tanpa label.
 */
export const SATELLITE_TILE_URL =
  "https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

export const SATELLITE_ATTRIBUTION =
  'Powered by <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a> &middot; Citra: Esri, Maxar, Earthstar Geographics, dan GIS User Community';

/** Zoom data detail Pangandaran yang dipakai: 15 memuat bangunan dan tempat bernama. */
const DETAIL_ZOOM = 15;

/** Lapisan detail Pangandaran yang dipakai; null bila manifest tidak memuatnya. */
export const detailLayerOf = (manifest: BasemapManifest): BasemapLayer | null => {
  const variants = manifest.layers.filter((layer) => layer.name === "pangandaran");
  return variants.find((layer) => layer.maxzoom === DETAIL_ZOOM) ?? variants[0] ?? null;
};

let manifestRequest: Promise<BasemapManifest | null> | null = null;

/**
 * Manifest dibaca sekali per halaman bila berhasil; null bila tidak tersedia (mis. offline
 * tanpa cache). Kegagalan tidak disimpan, sehingga pemanggilan berikutnya mencoba lagi.
 */
export const loadBasemapManifest = (): Promise<BasemapManifest | null> => {
  manifestRequest ??= fetch(MANIFEST_URL)
    .then((response) => (response.ok ? (response.json() as Promise<BasemapManifest>) : null))
    .catch(() => null)
    .then((manifest) => {
      if (!manifest) manifestRequest = null;
      return manifest;
    });
  return manifestRequest;
};

/** Awal setiap file PMTiles v3 ("PMTiles" + versi). */
const PMTILES_MAGIC = "PMTiles";

/**
 * File peta valid: bukan HTML pengganti (fallback SPA saat file tidak ada), ukurannya sama
 * dengan manifest, dan diawali magic number PMTiles.
 */
const isValidBasemapFile = (data: ArrayBuffer, expectedBytes: number): boolean =>
  data.byteLength === expectedBytes &&
  new TextDecoder().decode(new Uint8Array(data, 0, PMTILES_MAGIC.length)) === PMTILES_MAGIC;

/** Cache lama yang berisi HTML atau ukurannya tidak sesuai manifest dianggap rusak. */
const isCachedResponseValid = (response: Response, expectedBytes: number): boolean =>
  !(response.headers.get("content-type") ?? "").includes("text/html") &&
  Number(response.headers.get("content-length") ?? expectedBytes) === expectedBytes;

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
  const url = basemapUrl(detail);

  for (const request of await cache.keys()) {
    const path = new URL(request.url).pathname;
    if (path.endsWith(".pmtiles") && path !== url) {
      await cache.delete(request);
    }
  }

  const cached = await cache.match(url);
  if (cached && isCachedResponseValid(cached, detail.bytes)) return;
  // Salinan rusak dihapus lebih dulu agar fetch di bawah tidak dilayani service worker
  // dari salinan itu.
  if (cached) await cache.delete(url);

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status} untuk ${url}`);
  const data = await response.arrayBuffer();
  if (!isValidBasemapFile(data, detail.bytes)) {
    await cache.delete(url);
    throw new Error(`File peta ${url} tidak valid (bukan PMTiles atau ukuran tidak sesuai manifest)`);
  }
  await cache.put(url, new Response(data, { status: 200, headers: response.headers }));
};
