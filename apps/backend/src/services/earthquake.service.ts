/**
 * Service untuk fetch & parsing data gempa BMKG.
 *
 * Sumber data:
 * - autogempa.json          : Gempa terbaru Indonesia
 * - gempaterkini.json       : Daftar 15 gempa M5+ Indonesia
 * - gempadirasakan.json     : Daftar gempa yang dirasakan
 *
 * Dashboard menggunakan proximity filtering
 * untuk memilih gempa yang relevan bagi
 * kartu Jawa Barat dan Desa Cibenda.
 */

import { requestWithRetry } from "../utils/httpRetryWrapper.js";
import type {
  BmkgAutogempaResponse,
  BmkgEarthquakeItem,
  BmkgEarthquakeListResponse,
  EarthquakeInfo,
} from "../types/earthquake.types.js";

const BMKG_AUTOGEMPA_URL =
  "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json";
const BMKG_GEMPA_TERKINI_URL =
  "https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json";
const BMKG_GEMPA_DIRASAKAN_URL =
  "https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json";
const SHAKEMAP_BASE_URL = "https://data.bmkg.go.id/DataMKG/TEWS/";

const EARTHQUAKE_CACHE_TTL_MS = Number(
  process.env.EARTHQUAKE_CACHE_TTL_MS ?? 30000,
);

const PANGANDARAN_RADIUS_KM = Number(process.env.PANGANDARAN_RADIUS_KM ?? 150);

const WEST_JAVA_RADIUS_KM = Number(process.env.WEST_JAVA_RADIUS_KM ?? 350);

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const earthquakeCache = new Map<string, CacheEntry<unknown>>();

const getVillageCoordinates = () => {
  const latitude = Number.parseFloat(process.env.VILLAGE_LAT ?? "");
  const longitude = Number.parseFloat(process.env.VILLAGE_LON ?? "");

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error(
      "VILLAGE_LAT and VILLAGE_LON must be defined in environment variables.",
    );
  }

  return { latitude, longitude };
};

/**
 * ⚠️ Koordinat Desa Cibenda dibaca dari environment/backend configuration.
 * Jangan hardcode di mana pun selain sumber konfigurasi.
 */
const DESA_CIBENDA_COORDINATES = getVillageCoordinates();

export class EarthquakeService {
  static async getIndonesia(): Promise<EarthquakeInfo> {
    const raw =
      await this.fetchCached<BmkgAutogempaResponse>(BMKG_AUTOGEMPA_URL);
    return this.parse(raw.Infogempa.gempa);
  }

  /**
 * Mengembalikan gempa terdekat terhadap
 * Desa Cibenda berdasarkan radius tertentu.
 *
 * Return null jika tidak ada gempa
 * yang memenuhi radius.
 */
  private static findNearestEarthquake(
    earthquakes: BmkgEarthquakeItem[],
    radiusKm: number,
  ): EarthquakeInfo | null {
    if (earthquakes.length === 0) {
      return null;
    }

    return (
      earthquakes
        .map((earthquake) => this.parse(earthquake))
        .filter(
          (earthquake) =>
            Number.isFinite(earthquake.distanceToVillage) &&
            earthquake.distanceToVillage <= radiusKm,
        )
        .sort((left, right) => {
          const distanceDelta =
            left.distanceToVillage - right.distanceToVillage;

          if (distanceDelta !== 0) {
            return distanceDelta;
          }

          return right.updatedAt.localeCompare(left.updatedAt);
        })[0] ?? null
    );
  }

  static async getLatest(): Promise<EarthquakeInfo> {
    return this.getIndonesia();
  }

  static async getWestJava(): Promise<EarthquakeInfo | null> {
    const raw = await this.fetchCached<BmkgEarthquakeListResponse>(
      BMKG_GEMPA_TERKINI_URL,
    );

    return this.findNearestEarthquake(
      raw.Infogempa.gempa ?? [],
      WEST_JAVA_RADIUS_KM,
    );
  }

  static async getPangandaran(): Promise<EarthquakeInfo | null> {
    const raw = await this.fetchCached<BmkgEarthquakeListResponse>(
      BMKG_GEMPA_TERKINI_URL,
    );

    return this.findNearestEarthquake(
      raw.Infogempa.gempa ?? [],
      PANGANDARAN_RADIUS_KM,
    );
  }

  private static async fetchCached<T>(url: string): Promise<T> {
    const cached = earthquakeCache.get(url) as CacheEntry<T> | undefined;

    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const data = await requestWithRetry<T>(
      url,
      {},
      { retries: 3, retryDelayMs: 1000, backoffFactor: 2, timeoutMs: 8000 },
    );

    earthquakeCache.set(url, {
      data,
      expiresAt: Date.now() + EARTHQUAKE_CACHE_TTL_MS,
    });

    return data;
  }

  private static parse(raw: BmkgEarthquakeItem): EarthquakeInfo {
    const [latStr, lonStr] = raw.Coordinates.split(",");
    const latitude = Number.parseFloat(latStr?.trim() ?? "");
    const longitude = Number.parseFloat(lonStr?.trim() ?? "");
    const updatedAt = this.toIso(raw.DateTime);

    return {
      magnitude: Number.parseFloat(raw.Magnitude),
      depth: raw.Kedalaman,
      location: raw.Wilayah,
      coordinates: { latitude, longitude },
      distanceToVillage: this.haversineDistanceKm(
        latitude,
        longitude,
        DESA_CIBENDA_COORDINATES.latitude,
        DESA_CIBENDA_COORDINATES.longitude,
      ),
      felt: raw.Dirasakan ?? "",
      potential: raw.Potensi ?? "",
      shakemap: raw.Shakemap ? `${SHAKEMAP_BASE_URL}${raw.Shakemap}` : "",
      updatedAt,
    };
  }

  private static toIso(rawDatetime: string | undefined): string {
    if (!rawDatetime) return new Date().toISOString();

    const normalized = rawDatetime.includes("T")
      ? rawDatetime
      : rawDatetime.replace(" ", "T");
    const withOffset = /([+-]\d{2}:\d{2}|Z)$/i.test(normalized)
      ? normalized
      : `${normalized}Z`;
    const date = new Date(withOffset);

    return Number.isNaN(date.getTime())
      ? new Date().toISOString()
      : date.toISOString();
  }

  /** Jarak great-circle antara dua titik koordinat, dalam km (rumus Haversine) */
  private static haversineDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const EARTH_RADIUS_KM = 6371;
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(EARTH_RADIUS_KM * c);
  }
}
