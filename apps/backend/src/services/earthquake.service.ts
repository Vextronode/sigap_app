/**
 * Service untuk fetch & parsing data gempa BMKG.
 *
 * Sumber data:
 * - autogempa.json          : Gempa terbaru Indonesia
 * - gempaterkini.json       : Daftar 15 gempa M5+ Indonesia
 * - gempadirasakan.json     : Daftar gempa yang dirasakan
 */

import { requestWithRetry } from "../utils/httpRetryWrapper.js";
import { prisma } from "../config/prisma.js";
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

const PANGANDARAN_RADIUS_KM = Number(process.env.PANGANDARAN_RADIUS_KM ?? 100);
const WEST_JAVA_RADIUS_KM = Number(process.env.WEST_JAVA_RADIUS_KM ?? 350);

// Batas umur gempa yang masih dianggap "relevan" untuk ditampilkan di card
// Jawa Barat & Pangandaran (maksimal 7 hari / 1 minggu).
const PANGANDARAN_MAX_AGE_DAYS = Number(
  process.env.PANGANDARAN_MAX_AGE_DAYS ?? 7,
);
const WEST_JAVA_MAX_AGE_DAYS = Number(
  process.env.WEST_JAVA_MAX_AGE_DAYS ?? 7,
);

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
   * Mengembalikan gempa terdekat terhadap Desa Cibenda berdasarkan radius
   * dan umur maksimum tertentu. Return null jika tidak ada gempa yang
   * memenuhi kriteria (dianggap kondisi aman, bukan error).
   */
  private static findNearestEarthquake(
    earthquakes: BmkgEarthquakeItem[],
    radiusKm: number,
    maxAgeDays: number,
  ): EarthquakeInfo | null {
    if (earthquakes.length === 0) {
      return null;
    }

    const cutoffMs = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

    return (
      earthquakes
        .map((earthquake) => this.parse(earthquake))
        .filter(
          (earthquake) =>
            Number.isFinite(earthquake.distanceToVillage) &&
            earthquake.distanceToVillage <= radiusKm &&
            new Date(earthquake.updatedAt).getTime() >= cutoffMs,
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

  private static async fetchCombinedList(): Promise<BmkgEarthquakeItem[]> {
    try {
      const [terkini, dirasakan] = await Promise.all([
        this.fetchCached<BmkgEarthquakeListResponse>(BMKG_GEMPA_TERKINI_URL).catch(() => null),
        this.fetchCached<BmkgEarthquakeListResponse>(BMKG_GEMPA_DIRASAKAN_URL).catch(() => null),
      ]);

      const itemsTerkini = terkini?.Infogempa?.gempa ?? [];
      const itemsDirasakan = dirasakan?.Infogempa?.gempa ?? [];

      return [...itemsTerkini, ...itemsDirasakan];
    } catch {
      return [];
    }
  }

  static async getLatest(): Promise<EarthquakeInfo> {
    return this.getIndonesia();
  }

  static async getWestJava(): Promise<EarthquakeInfo | null> {
    const rawItems = await this.fetchCombinedList();

    return this.findNearestEarthquake(
      rawItems,
      WEST_JAVA_RADIUS_KM,
      WEST_JAVA_MAX_AGE_DAYS,
    );
  }

  static async getPangandaran(): Promise<EarthquakeInfo | null> {
    const rawItems = await this.fetchCombinedList();

    // Saring gempa khusus Pangandaran: menyebut nama Pangandaran ATAU berjarak <= 100 km dari Desa Cibenda
    const pangandaranItems = rawItems.filter((item) => {
      const locationLower = item.Wilayah?.toLowerCase() ?? "";
      const feltLower = item.Dirasakan?.toLowerCase() ?? "";
      const isPangandaranName =
        locationLower.includes("pangandaran") || feltLower.includes("pangandaran");

      const parsed = this.parse(item);
      const isClose =
        Number.isFinite(parsed.distanceToVillage) &&
        parsed.distanceToVillage <= 100;

      return isPangandaranName || isClose;
    });

    let nearest = this.findNearestEarthquake(
      pangandaranItems,
      PANGANDARAN_RADIUS_KM,
      PANGANDARAN_MAX_AGE_DAYS,
    );

    if (nearest) {
      nearest = await this.attachShakemapIfSameEvent(nearest);
    }

    return this.persistAndRetrievePangandaranShakemap(nearest);
  }

  /**
   * Menangkap & menyimpan data gempa Pangandaran beserta URL Shakemap-nya ke Database
   * agar Shakemap tetap ada walau BMKG memperbarui autogempa.json ke gempa nasional lain.
   */
  private static async persistAndRetrievePangandaranShakemap(
    earthquake: EarthquakeInfo | null,
  ): Promise<EarthquakeInfo | null> {
    try {
      if (earthquake) {
        // Cari record yang sudah tersimpan di database
        const existingRecord = await prisma.earthquakeRecord.findUnique({
          where: { eventTime: earthquake.updatedAt },
        });

        // Tentukan Shakemap akhir: prioritas URL baru, jika kosong gunakan URL tersimpan di DB
        const finalShakemap = earthquake.shakemap || existingRecord?.shakemap || null;

        // Upsert ke database agar tersimpan permanen
        const saved = await prisma.earthquakeRecord.upsert({
          where: { eventTime: earthquake.updatedAt },
          update: {
            magnitude: earthquake.magnitude,
            depth: earthquake.depth,
            location: earthquake.location,
            latitude: earthquake.coordinates.latitude,
            longitude: earthquake.coordinates.longitude,
            distanceToVillage: earthquake.distanceToVillage,
            felt: earthquake.felt,
            potential: earthquake.potential,
            shakemap: finalShakemap,
          },
          create: {
            eventTime: earthquake.updatedAt,
            magnitude: earthquake.magnitude,
            depth: earthquake.depth,
            location: earthquake.location,
            latitude: earthquake.coordinates.latitude,
            longitude: earthquake.coordinates.longitude,
            distanceToVillage: earthquake.distanceToVillage,
            felt: earthquake.felt,
            potential: earthquake.potential,
            shakemap: finalShakemap,
          },
        });

        return {
          ...earthquake,
          shakemap: saved.shakemap ?? "",
        };
      }

      // Jika gempa Pangandaran tidak ada di live API BMKG, ambil dari Database tersimpan khusus Pangandaran
      const cutoffMs = Date.now() - PANGANDARAN_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
      const latestDbRecord = await prisma.earthquakeRecord.findFirst({
        where: {
          OR: [
            { location: { contains: "Pangandaran", mode: "insensitive" } },
            { felt: { contains: "Pangandaran", mode: "insensitive" } },
            { distanceToVillage: { lte: 100 } },
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      if (latestDbRecord && new Date(latestDbRecord.eventTime).getTime() >= cutoffMs) {
        return {
          magnitude: latestDbRecord.magnitude,
          depth: latestDbRecord.depth,
          location: latestDbRecord.location,
          coordinates: {
            latitude: latestDbRecord.latitude,
            longitude: latestDbRecord.longitude,
          },
          distanceToVillage: latestDbRecord.distanceToVillage,
          felt: latestDbRecord.felt ?? "",
          potential: latestDbRecord.potential ?? "",
          shakemap: latestDbRecord.shakemap ?? "",
          updatedAt: latestDbRecord.eventTime,
        };
      }

      return null;
    } catch (error) {
      console.error("[EarthquakeService] Error persisting record:", error);
      return earthquake;
    }
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

  /**
   * BMKG cuma menyediakan field Shakemap di autogempa.json (gempa nasional
   * terbaru), tidak ada di gempaterkini.json. Kalau gempa yang dipilih untuk
   * Pangandaran kebetulan sama dengan gempa nasional terbaru itu (dicocokkan
   * lewat waktu kejadian, karena BMKG tidak menyediakan ID unik per gempa di
   * API publik ini), pinjam shakemap-nya. Kalau tidak sama, tetap kosong —
   * itu representasi jujur bahwa BMKG tidak sediakan shakemap untuk event
   * lama lewat API list.
   */
  private static async attachShakemapIfSameEvent(
    earthquake: EarthquakeInfo,
  ): Promise<EarthquakeInfo> {
    if (earthquake.shakemap) return earthquake;

    const rawLatest = await this.fetchCached<BmkgAutogempaResponse>(
      BMKG_AUTOGEMPA_URL,
    );
    const latest = this.parse(rawLatest.Infogempa.gempa);

    const isSameEvent = latest.updatedAt === earthquake.updatedAt;

    return isSameEvent
      ? { ...earthquake, shakemap: latest.shakemap }
      : earthquake;
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