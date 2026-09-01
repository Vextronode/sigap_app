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
import { ALERT_RULES } from "../config/alertRules.js";
import type { DecisionInput, DecisionResult, TsunamiStatus } from "../types/alert.types.js";

const ALERT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 jam (1 hari)

const isFeltNearVillage = (felt: string | undefined): boolean => {
  if (!felt) return false;

  const normalized = felt.toLowerCase();
  return ALERT_RULES.earthquake.feltAreaKeywords.some((keyword) =>
    normalized.includes(keyword.toLowerCase())
  );
};

export class DecisionEngineService {
  static evaluate(input: DecisionInput): DecisionResult {
    const { earthquake, tsunami } = input;

    /**
     * ============================
     * PRIORITAS 1
     * Status tsunami (resmi InaTEWS via override manual, ATAU estimasi
     * SIGAP dari data gempa — lihat BmkgService.getTsunamiStatus()).
     * ============================
     */
    if (tsunami && tsunami.status !== "NORMAL") {
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
    }

    /**
     * ============================
     * PRIORITAS 2
     * Gempa (sudah difilter relevan untuk Desa Cibenda oleh
     * EarthquakeService.getPangandaran() sebelum sampai di sini).
     *
     * Umur aktif alert gempa = 24 Jam (1 Hari). Jika gempa lebih dari 24 jam,
     * status alert otomatis kembali ke GREEN (Aman).
     * ============================
     */
    if (earthquake) {
      const { magnitude, felt, updatedAt } = earthquake;
      const ageMs = Date.now() - new Date(updatedAt).getTime();

      // Cek apakah gempa masih berusia <= 24 jam (1 hari)
      if (ageMs <= ALERT_MAX_AGE_MS) {
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
      }
    }

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