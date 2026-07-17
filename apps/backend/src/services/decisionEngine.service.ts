/**
 * Decision Engine sederhana — menentukan level kesiapsiagaan berdasarkan
 * data gempa terkini.
 *
 * ⚠️⚠️ SANGAT PENTING — BACA SEBELUM PR / DEPLOY:
 * Ambang batas magnitudo & radius di bawah ini adalah RULES DRAFT hasil
 * asumsi teknis, BUKAN angka resmi dari BPBD/BMKG/tim SIGAP. Data Dictionary
 * domain IoT Kesiapsiagaan cuma kasih tau ADA 4 level (GREEN/YELLOW/ORANGE/RED)
 * dan level mana yang boleh memicu sirine — tapi TIDAK menyebutkan
 * ambang batas magnitudo/radius yang memicu tiap level.
 *
 * Ini sistem peringatan dini bencana — kalau rules ini dipakai di produksi
 * tanpa direview oleh pihak yang paham kebencanaan (BPBD/ahli terkait),
 * risikonya nyata: false alarm ATAU (lebih bahaya) gagal memperingatkan.
 *
 * TODO WAJIB sebelum merge ke `main`/dipakai user asli:
 * - Minta rules resmi dari tim/BPBD/dokumen PRD terkait "Alert Rules"
 * - Review nilai magnitude/radius di bawah ini bersama yang berwenang
 */

import type { EarthquakeInfo } from "../types/earthquake.types.js";
import { AlertLevel } from "../../generated/prisma/enums.js";

interface AlertRule {
  /** Level alert sesuai enum Prisma */
  level: AlertLevel;

  matches: (magnitude: number, distanceKm: number) => boolean;

  reason: (magnitude: number, distanceKm: number) => string;
}

// Diurutkan dari paling parah ke paling ringan — rule pertama yang cocok yang dipakai
const RULES: AlertRule[] = [
  {
    level: AlertLevel.RED,
    matches: (m, d) => m >= 7 || (m >= 6 && d <= 100),
    reason: (m, d) =>
      `Gempa Magnitudo ${m} dalam radius ${d} km — berpotensi merusak.`,
  },
  {
    level: AlertLevel.ORANGE,
    matches: (m, d) => m >= 6 || (m >= 5 && d <= 150),
    reason: (m, d) =>
      `Gempa Magnitudo ${m} dalam radius ${d} km.`,
  },
  {
    level: AlertLevel.YELLOW,
    matches: (m) => m >= 5,
    reason: (m, d) =>
      `Gempa Magnitudo ${m} dalam radius ${d} km.`,
  },
];

const SAFE_DEFAULT: AlertRule = {
  level: AlertLevel.GREEN,
  matches: () => true,
  reason: () => "Tidak ada indikasi bahaya terkini.",
};

export interface DecisionResult {
  level: AlertLevel;
  source: string;
  description: string;
}

export class DecisionEngineService {
  /** Tentukan alert level berdasarkan data gempa terkini */
  static evaluateFromEarthquake(
    earthquake: EarthquakeInfo
  ): DecisionResult {
    const { magnitude, distanceToVillage } = earthquake;

    const rule =
      RULES.find((r) => r.matches(magnitude, distanceToVillage)) ??
      SAFE_DEFAULT;

    return {
      level: rule.level,
      source: "BMKG",
      description: rule.reason(magnitude, distanceToVillage),
    };
  }
}