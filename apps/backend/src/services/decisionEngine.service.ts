/**
 * Decision Engine sederhana — menentukan level kesiapsiagaan berdasarkan
 * data gempa terkini.
 *
 * Sumber gempa (lihat alert.scheduler.ts): `EarthquakeService.getPangandaran()`,
 * bukan gempa nasional terbaru. Artinya radius & umur maksimum gempa yang
 * masuk ke sini SUDAH difilter relevansinya sebelum sampai ke engine ini
 * (lihat `findNearestEarthquake` di earthquake.service.ts) — engine ini
 * tidak perlu (dan sengaja tidak) menghitung ulang radius sebagai penentu
 * severity, sesuai prinsip yang sudah ditulis di Rules_Alerts.md §5: radius
 * adalah filter relevansi, bukan penentu tingkat bahaya.
 *
 * Severity gempa (YELLOW vs ORANGE) ditentukan dari field `felt` (Dirasakan)
 * BMKG — laporan skala MMI (Modified Mercalli Intensity) resmi per lokasi —
 * BUKAN dari ambang batas magnitudo buatan sendiri. Ini sengaja: BMKG sudah
 * menyediakan ukuran "apakah gempa ini dirasakan warga" secara resmi, jadi
 * tim tidak perlu (dan sebaiknya tidak) menebak skala severity sendiri.
 *
 * Status tsunami (PRIORITAS 1) sekarang bisa berasal dari override manual
 * InaTEWS ATAU estimasi otomatis SIGAP dari field `Potensi` gempa — lihat
 * `BmkgService.getTsunamiStatus()`. Engine ini tidak peduli mana dari
 * keduanya, dia cuma pakai `source`/`description` apa adanya dari sana
 * (estimasi otomatis dibatasi maksimal WASPADA di level itu, bukan di sini).
 */

import { AlertLevel } from "../../generated/prisma/enums.js";
import { ALERT_RULES } from "../config/alertRules.js";

import type { DecisionInput, DecisionResult, TsunamiStatus } from "../types/alert.types.js";

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
     * Deskripsi & source dipakai apa adanya dari sana, supaya alert di
     * dashboard tidak pernah mengklaim lebih dari yang sebenarnya diketahui.
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
     * EarthquakeService.getPangandaran() sebelum sampai di sini)
     * ============================
     */
    if (earthquake) {
      const { magnitude, felt } = earthquake;

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

    /**
     * ============================
     * Default
     * ============================
     */

    return {
      level: AlertLevel.GREEN,
      source: "BMKG",
      description: "Tidak terdapat peringatan resmi BMKG.",
    };
  }
}