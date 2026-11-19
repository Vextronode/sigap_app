/**
 * Service untuk fetch & parsing data gempa BMKG.
 *
 * Sumber data:
 * - autogempa.json          : Gempa terbaru Indonesia
 * - gempaterkini.json       : Daftar 15 gempa M5+ Indonesia
 * - gempadirasakan.json     : Daftar gempa yang dirasakan
 */

import { requestWithRetry } from "../utils/httpRetryWrapper.js";
import { EarthquakeRecordRepository } from "../repositories/earthquakeRecord.repository.js";
import {
  classifyTsunamiPotential,
  isFeltNearVillage,
  mergeBmkgFeeds,
  parseBmkgDateTime,
  parseFeltAreas,
} from "../utils/bmkgEarthquake.util.js";
import { ALERT_ACTIVE_MAX_AGE_MS } from "../config/alertRules.js";
import type {
  BmkgAutogempaResponse,
  BmkgEarthquakeItem,
  BmkgEarthquakeListResponse,
  EarthquakeInfo,
} from "../types/earthquake.types.js";
import type { EarthquakeRecord } from "../../generated/prisma/client.js";

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
// Pangandaran (maksimal 7 hari / 1 minggu).
const PANGANDARAN_MAX_AGE_DAYS = Number(
  process.env.PANGANDARAN_MAX_AGE_DAYS ?? 7,
);

/** Kriteria rekaman gempa Pangandaran pada earthquake_records. */
const PANGANDARAN_RECORD_MATCH = {
  locationContains: ["Pangandaran"],
  feltContains: ["Pangandaran"],
  maxDistanceKm: PANGANDARAN_RADIUS_KM,
};

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const earthquakeCache = new Map<string, CacheEntry<unknown>>();

/** Waktu gempaterkini atau gempadirasakan terakhir berhasil diambil dari BMKG. */
let lastFeedSuccessAt: string | null = null;

// In-Memory cache khusus fallback database PostgreSQL untuk mencegah
// query berulang ke DB pada kondisi feed tenang (tanpa gempa baru).
const DB_FALLBACK_CACHE_TTL_MS = 10 * 60 * 1000; // 10 menit
let cachedWestJavaDbRecord: { data: EarthquakeInfo | null; expiresAt: number } | null = null;
let cachedPangandaranRecentDbRecord: { data: EarthquakeInfo | null; expiresAt: number } | null = null;
let cachedPangandaranHistoryDbRecord: { data: EarthquakeInfo | null; expiresAt: number } | null = null;

export function invalidateEarthquakeDbCache() {
  cachedWestJavaDbRecord = null;
  cachedPangandaranRecentDbRecord = null;
  cachedPangandaranHistoryDbRecord = null;
}

const DEFAULT_VILLAGE_LAT = -7.6838;
const DEFAULT_VILLAGE_LON = 108.5610;

const getVillageCoordinates = () => {
  const latStr = process.env.VILLAGE_LAT;
  const lonStr = process.env.VILLAGE_LON;

  const latitude = latStr ? Number.parseFloat(latStr) : DEFAULT_VILLAGE_LAT;
  const longitude = lonStr ? Number.parseFloat(lonStr) : DEFAULT_VILLAGE_LON;

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return { latitude: DEFAULT_VILLAGE_LAT, longitude: DEFAULT_VILLAGE_LON };
  }

  return { latitude, longitude };
};

/**
 * ⚠️ Koordinat Desa Cibenda dibaca dari environment/backend configuration.
 * Jangan hardcode di mana pun selain sumber konfigurasi.
 */
const DESA_CIBENDA_COORDINATES = getVillageCoordinates();

/**
 * Validasi koordinat geografis wilayah Indonesia dan sekitarnya (termasuk zona subduksi & palung tektonik).
 * Mencegah data anomali atau data feed rusak terplot di Samudra Hindia bagian selatan, kutub, atau Australia.
 */
function isValidIndonesianCoordinate(lat: number, lon: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -15 &&
    lat <= 10 &&
    lon >= 90 &&
    lon <= 145
  );
}

/** Rekaman `earthquake_records` dalam bentuk yang sama dengan data live. */
const fromRecord = (record: EarthquakeRecord): EarthquakeInfo => ({
  magnitude: record.magnitude,
  depth: record.depth,
  location: record.location,
  coordinates: { latitude: record.latitude, longitude: record.longitude },
  distanceToVillage: record.distanceToVillage,
  felt: record.felt ?? "",
  feltAreas: parseFeltAreas(record.felt ?? ""),
  potential: record.potential ?? "",
  tsunamiPotential: classifyTsunamiPotential(record.potential ?? ""),
  shakemap: record.shakemap ?? "",
  updatedAt: record.eventTime,
});

const isPresent = <T>(value: T | null): value is T => value !== null;

/**
 * Gempa relevan untuk Desa Cibenda: episenter dalam PANGANDARAN_RADIUS_KM, atau
 * dirasakan di wilayah kata kunci desa berapa pun jaraknya (ADR-046).
 */
const isRelevantToVillage = (earthquake: EarthquakeInfo): boolean =>
  (Number.isFinite(earthquake.distanceToVillage) &&
    earthquake.distanceToVillage <= PANGANDARAN_RADIUS_KM) ||
  isFeltNearVillage(earthquake.feltAreas);

/** true bila data live berbeda dari rekaman tersimpan sehingga perlu disimpan ulang. */
const differsFromRecord = (live: EarthquakeInfo, stored: EarthquakeInfo | undefined): boolean =>
  !stored ||
  live.magnitude !== stored.magnitude ||
  live.location !== stored.location ||
  (live.felt !== "" && live.felt !== stored.felt) ||
  (live.potential !== "" && live.potential !== stored.potential) ||
  (live.shakemap !== "" && live.shakemap !== stored.shakemap);

export class EarthquakeService {
  static async getIndonesia(): Promise<EarthquakeInfo> {
    try {
      const raw =
        await this.fetchCached<BmkgAutogempaResponse>(BMKG_AUTOGEMPA_URL);
      const parsed = this.parse(raw.Infogempa.gempa);
      if (!parsed) throw new Error("Data autogempa BMKG tidak valid.");
      return parsed;
    } catch (error) {
      console.warn(
        "[EarthquakeService] Gagal fetch autogempa BMKG, mencoba fallback DB history:",
        error instanceof Error ? error.message : error
      );
      const latestDbRecord = await EarthquakeRecordRepository.findLatest();
      if (latestDbRecord) {
        return fromRecord(latestDbRecord);
      }
      throw error;
    }
  }

  /**
   * Mengembalikan gempa yang lolos filter relevansi dan umur maksimum tertentu.
   * Return null jika tidak ada gempa yang memenuhi kriteria (dianggap kondisi
   * aman, bukan error).
   */
  private static findNearestEarthquake(
    earthquakes: BmkgEarthquakeItem[],
    isRelevant: (earthquake: EarthquakeInfo) => boolean,
    maxAgeDays?: number,
    sortBy: "nearest" | "latest" = "nearest",
  ): EarthquakeInfo | null {
    if (earthquakes.length === 0) {
      return null;
    }

    const cutoffMs =
      typeof maxAgeDays === "number"
        ? Date.now() - maxAgeDays * 24 * 60 * 60 * 1000
        : null;

    return (
      earthquakes
        .map((earthquake) => this.parse(earthquake))
        .filter(isPresent)
        .filter(
          (earthquake) =>
            isRelevant(earthquake) &&
            (cutoffMs === null || new Date(earthquake.updatedAt).getTime() >= cutoffMs),
        )
        .sort((left, right) => {
          if (sortBy === "latest") {
            const timeDelta =
              new Date(right.updatedAt).getTime() -
              new Date(left.updatedAt).getTime();

            if (timeDelta !== 0) {
              return timeDelta;
            }

            return left.distanceToVillage - right.distanceToVillage;
          }

          const distanceDelta =
            left.distanceToVillage - right.distanceToVillage;

          if (distanceDelta !== 0) {
            return distanceDelta;
          }

          return right.updatedAt.localeCompare(left.updatedAt);
        })[0] ?? null
    );
  }

  /** Gempa dari ketiga feed BMKG, sudah disatukan per kejadian (ADR-046). */
  private static async fetchCombinedList(): Promise<BmkgEarthquakeItem[]> {
    try {
      const [auto, terkini, dirasakan] = await Promise.all([
        this.fetchCached<BmkgAutogempaResponse>(BMKG_AUTOGEMPA_URL).catch(() => null),
        this.fetchCached<BmkgEarthquakeListResponse>(BMKG_GEMPA_TERKINI_URL).catch(() => null),
        this.fetchCached<BmkgEarthquakeListResponse>(BMKG_GEMPA_DIRASAKAN_URL).catch(() => null),
      ]);

      return mergeBmkgFeeds({
        auto: auto?.Infogempa?.gempa ?? null,
        terkini: terkini?.Infogempa?.gempa ?? [],
        dirasakan: dirasakan?.Infogempa?.gempa ?? [],
      });
    } catch {
      return [];
    }
  }

  /**
   * Seluruh gempa relevan yang masih dalam masa aktif (24 jam), terbaru lebih dulu.
   * Data live digabung dengan `earthquake_records` agar gempa yang sudah tergeser
   * dari daftar BMKG tetap terhitung. Kejadian baru atau berubah disimpan (ADR-046).
   */
  static async getActiveEvents(): Promise<EarthquakeInfo[]> {
    const cutoffIso = new Date(Date.now() - ALERT_ACTIVE_MAX_AGE_MS).toISOString();

    const live = (await this.fetchCombinedList())
      .map((item) => this.parse(item))
      .filter(isPresent)
      .filter((earthquake) => earthquake.updatedAt >= cutoffIso && isRelevantToVillage(earthquake));

    let stored: EarthquakeInfo[] = [];
    try {
      const records = await EarthquakeRecordRepository.findSince(cutoffIso);
      stored = records.map(fromRecord).filter(isRelevantToVillage);
    } catch (error) {
      console.warn(
        "[EarthquakeService] Gagal membaca earthquake_records untuk gempa aktif:",
        error instanceof Error ? error.message : error
      );
    }

    const storedById = new Map(stored.map((earthquake) => [earthquake.updatedAt, earthquake]));
    const events = new Map(storedById);
    for (const earthquake of live) {
      const current = differsFromRecord(earthquake, storedById.get(earthquake.updatedAt))
        ? await this.persistAndRetrievePangandaranShakemap(earthquake)
        : (storedById.get(earthquake.updatedAt) as EarthquakeInfo);
      events.set(earthquake.updatedAt, current);
    }

    return [...events.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  /** Waktu daftar gempa BMKG terakhir berhasil diambil; null bila belum pernah. */
  static getLastFeedSuccessAt(): string | null {
    return lastFeedSuccessAt;
  }

  /** true bila minimal satu daftar gempa BMKG berhasil diambil. */
  static async isLiveDataAvailable(): Promise<boolean> {
    const results = await Promise.allSettled([
      this.fetchCached<BmkgEarthquakeListResponse>(BMKG_GEMPA_TERKINI_URL),
      this.fetchCached<BmkgEarthquakeListResponse>(BMKG_GEMPA_DIRASAKAN_URL),
    ]);
    return results.some((result) => result.status === "fulfilled");
  }

  static async getLatest(): Promise<EarthquakeInfo> {
    return this.getIndonesia();
  }

  /**
   * Mengambil kumpulan titik-titik sebaran gempa terkini untuk Peta Gempa:
   * 1. Gempa nasional terbaru (autogempa)
   * 2. 15 gempa M 5.0+ terkini (gempaterkini)
   * 3. 15 gempa dirasakan terkini (gempadirasakan)
   * 4. Riwayat gempa Pangandaran ber-shakemap di database
   *
   * Di-cache in-memory dan ter-deduplikasi agar hemat kuota database.
   */
  static async getMapPoints(): Promise<EarthquakeInfo[]> {
    const cacheKey = "MAP_EARTHQUAKE_POINTS";
    const cached = earthquakeCache.get(cacheKey) as CacheEntry<EarthquakeInfo[]> | undefined;
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    try {
      const [autoRaw, listItems, dbRecords] = await Promise.all([
        this.fetchCached<BmkgAutogempaResponse>(BMKG_AUTOGEMPA_URL).catch(() => null),
        this.fetchCombinedList().catch(() => []),
        EarthquakeRecordRepository.findRecent(15).catch(() => []),
      ]);

      const pointsMap = new Map<string, EarthquakeInfo>();

      // A. Masukkan autogempa nasional terbaru jika ada
      if (autoRaw?.Infogempa?.gempa) {
        const autoInfo = this.parse(autoRaw.Infogempa.gempa);
        if (
          autoInfo &&
          isValidIndonesianCoordinate(
            autoInfo.coordinates.latitude,
            autoInfo.coordinates.longitude,
          )
        ) {
          pointsMap.set(autoInfo.updatedAt, autoInfo);
        }
      }

      // B. Masukkan data dari feed gabungan terkini & dirasakan
      for (const item of listItems) {
        try {
          const parsed = this.parse(item);
          if (
            parsed &&
            isValidIndonesianCoordinate(
              parsed.coordinates.latitude,
              parsed.coordinates.longitude,
            ) &&
            !pointsMap.has(parsed.updatedAt)
          ) {
            pointsMap.set(parsed.updatedAt, parsed);
          }
        } catch {
          // Lewati item yang gagal diparsing
        }
      }

      // C. Masukkan riwayat gempa Pangandaran ber-shakemap dari database
      for (const rec of dbRecords) {
        if (!isValidIndonesianCoordinate(rec.latitude, rec.longitude)) {
          continue;
        }
        const eventTime = rec.eventTime;
        const existing = pointsMap.get(eventTime);
        if (!existing) {
          pointsMap.set(eventTime, fromRecord(rec));
        } else if (!existing.shakemap && rec.shakemap) {
          existing.shakemap = rec.shakemap;
        }
      }

      // Urutkan dari waktu kejadian paling baru
      const result = Array.from(pointsMap.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      earthquakeCache.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + EARTHQUAKE_CACHE_TTL_MS,
      });

      return result;
    } catch (error) {
      console.error("[EarthquakeService] Error getting map points:", error);
      return [];
    }
  }

  static async getWestJava(): Promise<EarthquakeInfo | null> {
    const rawItems = await this.fetchCombinedList();

    // 1. Ambil gempa terbaru wilayah Jawa Barat dari feed BMKG jika ada
    const liveNearest = this.findNearestEarthquake(
      rawItems,
      (earthquake) => earthquake.distanceToVillage <= WEST_JAVA_RADIUS_KM,
      undefined,
      "latest",
    );

    // 2. Simpan gempa feed ke database history jika ditemukan
    const savedLive = liveNearest
      ? await this.persistAndRetrievePangandaranShakemap(liveNearest)
      : null;

    // 3. Ambil record gempa Jawa Barat terakhir dari database history (dengan cache 10 menit)
    const now = Date.now();
    let dbInfo: EarthquakeInfo | null = null;

    if (cachedWestJavaDbRecord && cachedWestJavaDbRecord.expiresAt > now) {
      dbInfo = cachedWestJavaDbRecord.data;
    } else {
      const latestDbRecord = await EarthquakeRecordRepository.findLatestMatching({
        locationContains: ["Jawa Barat", "Jabar"],
        maxDistanceKm: WEST_JAVA_RADIUS_KM,
      });

      if (latestDbRecord) {
        dbInfo = fromRecord(latestDbRecord);
      }

      cachedWestJavaDbRecord = {
        data: dbInfo,
        expiresAt: now + DB_FALLBACK_CACHE_TTL_MS,
      };
    }

    if (dbInfo) {
      if (savedLive) {
        const liveTime = new Date(savedLive.updatedAt).getTime();
        const dbTime = new Date(dbInfo.updatedAt).getTime();
        return liveTime >= dbTime ? savedLive : dbInfo;
      }

      return dbInfo;
    }

    return savedLive ?? null;
  }

  static async getPangandaran(ignoreAgeLimit = false): Promise<EarthquakeInfo | null> {
    const rawItems = await this.fetchCombinedList();

    // Cari gempa relevan terkini (dalam batas umur 7 hari) dan urutkan berdasarkan yang paling baru
    const liveNearest = this.findNearestEarthquake(
      rawItems,
      isRelevantToVillage,
      PANGANDARAN_MAX_AGE_DAYS,
      "latest",
    );

    // Simpan data gempa live ke database jika ada
    const savedLive = liveNearest
      ? await this.persistAndRetrievePangandaranShakemap(liveNearest)
      : null;

    // Jika mode live (bukan riwayat), kembalikan data live jika masih dalam batas umur 7 hari
    if (!ignoreAgeLimit) {
      if (savedLive) {
        return savedLive;
      }

      // Cek apakah ada record di database yang masih dalam batas umur 7 hari (dengan cache 10 menit)
      const now = Date.now();
      let recentDbInfo: EarthquakeInfo | null = null;

      if (cachedPangandaranRecentDbRecord && cachedPangandaranRecentDbRecord.expiresAt > now) {
        recentDbInfo = cachedPangandaranRecentDbRecord.data;
      } else {
        const cutoffMs = now - PANGANDARAN_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
        const recentDbRecord = await EarthquakeRecordRepository.findLatestMatching(PANGANDARAN_RECORD_MATCH);

        if (recentDbRecord && new Date(recentDbRecord.eventTime).getTime() >= cutoffMs) {
          recentDbInfo = fromRecord(recentDbRecord);
        }

        cachedPangandaranRecentDbRecord = {
          data: recentDbInfo,
          expiresAt: now + DB_FALLBACK_CACHE_TTL_MS,
        };
      }

      return recentDbInfo;
    }

    // Jika mode riwayat (ignoreAgeLimit = true):
    // Ambil gempa terakhir secara kronologis (eventTime terbaru) dari database (dengan cache 10 menit)
    const now = Date.now();
    let historyDbInfo: EarthquakeInfo | null = null;

    if (cachedPangandaranHistoryDbRecord && cachedPangandaranHistoryDbRecord.expiresAt > now) {
      historyDbInfo = cachedPangandaranHistoryDbRecord.data;
    } else {
      const latestDbRecord = await EarthquakeRecordRepository.findLatestMatching(PANGANDARAN_RECORD_MATCH);

      if (latestDbRecord) {
        historyDbInfo = fromRecord(latestDbRecord);
      }

      cachedPangandaranHistoryDbRecord = {
        data: historyDbInfo,
        expiresAt: now + DB_FALLBACK_CACHE_TTL_MS,
      };
    }

    if (historyDbInfo) {
      if (savedLive) {
        const liveTime = new Date(savedLive.updatedAt).getTime();
        const dbTime = new Date(historyDbInfo.updatedAt).getTime();
        return liveTime >= dbTime ? savedLive : historyDbInfo;
      }

      return historyDbInfo;
    }

    return savedLive;
  }

  /**
   * Menangkap & menyimpan data gempa Pangandaran beserta URL Shakemap-nya ke Database
   * agar Shakemap tetap ada walau BMKG memperbarui autogempa.json ke gempa nasional lain.
   */
  private static async persistAndRetrievePangandaranShakemap(
    earthquake: EarthquakeInfo,
  ): Promise<EarthquakeInfo> {
    try {
      // Cari record yang sudah tersimpan di database
      const existingRecord = await EarthquakeRecordRepository.findByEventTime(earthquake.updatedAt);

      // Nilai baru diutamakan; nilai kosong tidak menimpa nilai tersimpan, karena tiap feed
      // BMKG hanya memuat sebagian field (ADR-046).
      const finalShakemap = earthquake.shakemap || existingRecord?.shakemap || null;
      const finalFelt = earthquake.felt || existingRecord?.felt || "";
      const finalPotential = earthquake.potential || existingRecord?.potential || "";

      // Upsert ke database agar tersimpan permanen
      const saved = await EarthquakeRecordRepository.upsert({
        eventTime: earthquake.updatedAt,
        magnitude: earthquake.magnitude,
        depth: earthquake.depth,
        location: earthquake.location,
        latitude: earthquake.coordinates.latitude,
        longitude: earthquake.coordinates.longitude,
        distanceToVillage: earthquake.distanceToVillage,
        felt: finalFelt,
        potential: finalPotential,
        shakemap: finalShakemap,
      });

      // Reset cache database in-memory agar record gempa baru langsung terbaca seketika
      invalidateEarthquakeDbCache();

      return fromRecord(saved);
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
      { retries: 1, retryDelayMs: 500, backoffFactor: 2, timeoutMs: 6000 },
    );

    if (url === BMKG_GEMPA_TERKINI_URL || url === BMKG_GEMPA_DIRASAKAN_URL) {
      lastFeedSuccessAt = new Date().toISOString();
    }

    earthquakeCache.set(url, {
      data,
      expiresAt: Date.now() + EARTHQUAKE_CACHE_TTL_MS,
    });

    return data;
  }

  private static parseCoordinates(raw: BmkgEarthquakeItem): { latitude: number; longitude: number } {
    let latitude = NaN;
    let longitude = NaN;

    if (raw.Coordinates && raw.Coordinates.includes(",")) {
      const [latStr, lonStr] = raw.Coordinates.split(",");
      latitude = Number.parseFloat(latStr?.trim() ?? "");
      longitude = Number.parseFloat(lonStr?.trim() ?? "");
    }

    // Fallback ekstra jika raw.Coordinates kosong/NaN tapi Lintang & Bujur ada
    if ((Number.isNaN(latitude) || Number.isNaN(longitude)) && raw.Lintang && raw.Bujur) {
      const latVal = Number.parseFloat(raw.Lintang.replace(/[^\d.-]/g, ""));
      const isLS = /LS/i.test(raw.Lintang);
      latitude = isLS ? -Math.abs(latVal) : Math.abs(latVal);

      const lonVal = Number.parseFloat(raw.Bujur.replace(/[^\d.-]/g, ""));
      const isBB = /BB/i.test(raw.Bujur);
      longitude = isBB ? -Math.abs(lonVal) : Math.abs(lonVal);
    }

    return { latitude, longitude };
  }

  /** null bila waktu, koordinat, atau magnitudo tidak valid; item tidak dipakai (ADR-046). */
  private static parse(raw: BmkgEarthquakeItem): EarthquakeInfo | null {
    const { latitude, longitude } = this.parseCoordinates(raw);
    const updatedAt = parseBmkgDateTime(raw.DateTime);
    const magnitude = Number.parseFloat(raw.Magnitude);

    if (
      !updatedAt ||
      !Number.isFinite(magnitude) ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return null;
    }

    return {
      magnitude,
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
      feltAreas: parseFeltAreas(raw.Dirasakan),
      potential: raw.Potensi ?? "",
      tsunamiPotential: classifyTsunamiPotential(raw.Potensi),
      shakemap: raw.Shakemap ? `${SHAKEMAP_BASE_URL}${raw.Shakemap}` : "",
      updatedAt,
    };
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