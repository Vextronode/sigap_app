/**
 * Decision Engine sederhana — menentukan level kesiapsiagaan berdasarkan
 * data gempa terkini.
 *
 * Sumber gempa (lihat alert.scheduler.ts): `EarthquakeService.getPangandaran()`,
 * bukan gempa nasional terbaru. Artinya radius & umur maksimum gempa yang
 * masuk ke sini SUDAH difilter relevansinya sebelum sampai ke engine ini
 * (lihat `findNearestEarthquake` di earthquake.service.ts).
 *
 * Umur status alert aktif dipatok maksimal 24 Jam (1 Hari) sejak waktu gempa.
 * Jika gempa berusia > 24 jam, status kesiapsiagaan otomatis kembali ke GREEN (Aman).
 */

import { AlertLevel } from "../../generated/prisma/enums.js";
import { ALERT_ACTIVE_MAX_AGE_MS, ALERT_RULES } from "../config/alertRules.js";
import type { DecisionInput, DecisionResult, TsunamiStatus } from "../types/alert.types.js";

const LEVEL_RANK: Record<AlertLevel, number> = {
  [AlertLevel.GREEN]: 0,
  [AlertLevel.YELLOW]: 1,
  [AlertLevel.ORANGE]: 2,
  [AlertLevel.RED]: 3,
};

const isFeltNearVillage = (felt: string | undefined): boolean => {
  if (!felt) return false;

  const normalized = felt.toLowerCase();
  return ALERT_RULES.earthquake.feltAreaKeywords.some((keyword) =>
    normalized.includes(keyword.toLowerCase())
  );
};

/**
 * Status tsunami (resmi InaTEWS via override manual, ATAU estimasi
 * SIGAP dari data gempa — lihat BmkgService.getTsunamiStatus()).
 */
const evaluateTsunami = (tsunami: DecisionInput["tsunami"]): DecisionResult | null => {
  if (!tsunami || tsunami.status === "NORMAL") return null;

  const tsunamiLevelMap: Record<Exclude<TsunamiStatus, "NORMAL">, AlertLevel> = {
    AWAS: AlertLevel.RED,
    SIAGA: AlertLevel.ORANGE,
    WASPADA: AlertLevel.YELLOW,
  };

  return {
    level: tsunamiLevelMap[tsunami.status as Exclude<TsunamiStatus, "NORMAL">],
    source: tsunami.source,
    description: tsunami.description,
  };
};

/**
 * Gempa (sudah difilter relevan untuk Desa Cibenda oleh
 * EarthquakeService.getPangandaran() sebelum sampai di sini).
 *
 * Umur aktif alert gempa = 24 Jam (1 Hari). Jika gempa lebih dari 24 jam,
 * gempa tidak lagi memengaruhi level.
 */
const evaluateEarthquake = (earthquake: DecisionInput["earthquake"]): DecisionResult | null => {
  if (!earthquake) return null;

  const { magnitude, felt, updatedAt } = earthquake;
  const ageMs = Date.now() - new Date(updatedAt).getTime();

  // Cek apakah gempa masih berusia <= 24 jam (1 hari)
  if (ageMs > ALERT_ACTIVE_MAX_AGE_MS) return null;

  if (isFeltNearVillage(felt)) {
    return {
      level: AlertLevel.ORANGE,
      source: "BMKG",
      description: `Gempa M${magnitude} dirasakan warga di sekitar Desa Cibenda (${felt}).`,
    };
  }

  return {
    level: AlertLevel.YELLOW,
    source: "BMKG",
    description: `Gempa M${magnitude} terdeteksi dalam radius pemantauan Desa Cibenda, namun belum ada laporan dirasakan warga. Tetap pantau informasi resmi BMKG.`,
  };
};

export class DecisionEngineService {
  /**
   * Level akhir = level tertinggi antara tsunami dan gempa (ADR-040).
   * Bila sama tinggi, status tsunami yang dipakai. Bila gempa lebih tinggi,
   * informasi tsunami tetap disertakan pada deskripsi.
   */
  static evaluate(input: DecisionInput): DecisionResult {
    const tsunami = evaluateTsunami(input.tsunami);
    const earthquake = evaluateEarthquake(input.earthquake);

    if (tsunami && earthquake && LEVEL_RANK[earthquake.level] > LEVEL_RANK[tsunami.level]) {
      return {
        ...earthquake,
        description: `${earthquake.description} ${tsunami.description}`,
      };
    }

    const result = tsunami ?? earthquake;
    if (result) return result;

    /**
     * ============================
     * Default (Aman)
     * ============================
     */
    return {
      level: AlertLevel.GREEN,
      source: "BMKG",
      description: "Tidak terdapat peringatan resmi BMKG.",
    };
  }
}