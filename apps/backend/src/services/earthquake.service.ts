/**
 * Service untuk fetch & parsing data gempa terbaru dari BMKG.
 * Sesuai API_SPEC.md §8.3 — GET /earthquakes/latest.
 *
 * BMKG Mapping: https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json
 */

import { requestWithRetry } from "../utils/httpRetryWrapper.js";
import type { BmkgAutogempaResponse, EarthquakeInfo } from "../types/earthquake.types.js";

const BMKG_AUTOGEMPA_URL = "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json";
const SHAKEMAP_BASE_URL = "https://data.bmkg.go.id/DataMKG/TEWS/";

/**
 * ⚠️ Koordinat Desa Cibenda di bawah ini PERKIRAAN, diambil dari contoh titik
 * evakuasi "Lapangan Desa" di API_SPEC.md §8.9 (lat -7.68, lng 108.65).
 * TODO: konfirmasi koordinat resmi pusat Desa Cibenda ke tim/data_dictionary.
 */
const DESA_CIBENDA_COORDINATES = { latitude: -7.68, longitude: 108.65 };

export class EarthquakeService {
  static async getLatest(): Promise<EarthquakeInfo> {
    const raw = await requestWithRetry<BmkgAutogempaResponse>(
      BMKG_AUTOGEMPA_URL,
      {},
      { retries: 3, retryDelayMs: 1000, backoffFactor: 2, timeoutMs: 8000 }
    );
    return this.parse(raw);
  }

  private static parse(raw: BmkgAutogempaResponse): EarthquakeInfo {
    const gempa = raw.Infogempa.gempa;
    const [latStr, lonStr] = gempa.Coordinates.split(",");
    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lonStr);

    return {
      magnitude: parseFloat(gempa.Magnitude),
      depth: gempa.Kedalaman,
      location: gempa.Wilayah,
      coordinates: { latitude, longitude },
      distanceToVillage: this.haversineDistanceKm(
        latitude,
        longitude,
        DESA_CIBENDA_COORDINATES.latitude,
        DESA_CIBENDA_COORDINATES.longitude
      ),
      felt: gempa.Dirasakan,
      potential: gempa.Potensi,
      shakemap: `${SHAKEMAP_BASE_URL}${gempa.Shakemap}`,
      updatedAt: new Date(gempa.DateTime).toISOString(),
    };
  }

  /** Jarak great-circle antara dua titik koordinat, dalam km (rumus Haversine) */
  private static haversineDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
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
