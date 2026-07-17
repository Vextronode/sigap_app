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

import { AlertLevel } from "../../generated/prisma/enums.js";
import { ALERT_RULES } from "../config/alertRules.js";

import type { DecisionInput, DecisionResult } from "../types/alert.types.js";

export class DecisionEngineService {
  static evaluate(input: DecisionInput): DecisionResult {

    const {
      earthquake,
      tsunamiStatus = "NORMAL",
    } = input;

    /**
     * ============================
     * PRIORITAS 1
     * Status resmi BMKG Tsunami
     * ============================
     */

    if (tsunamiStatus === "AWAS") {
      return {
        level: AlertLevel.RED,
        source: "BMKG InaTEWS",
        description:
          "BMKG mengeluarkan status AWAS. Evakuasi segera.",
      };
    }

    if (tsunamiStatus === "SIAGA") {
      return {
        level: AlertLevel.ORANGE,
        source: "BMKG InaTEWS",
        description:
          "BMKG mengeluarkan status SIAGA.",
      };
    }

    if (tsunamiStatus === "WASPADA") {
      return {
        level: AlertLevel.YELLOW,
        source: "BMKG InaTEWS",
        description:
          "BMKG mengeluarkan status WASPADA.",
      };
    }

    /**
     * ============================
     * PRIORITAS 2
     * Gempa
     * ============================
     */
      // Prioritas lebih tinggi dicek terlebih dahulu
      if (earthquake) {
        const radius = earthquake.distanceToVillage;
        const magnitude = earthquake.magnitude;
          if (
          magnitude >= ALERT_RULES.earthquake.significantMagnitude &&
          radius <= ALERT_RULES.radius.MEDIUM
        ) {
          return {
            level: AlertLevel.ORANGE,
            source: "BMKG",
            description: `Gempa signifikan M${magnitude} dalam radius ${radius} km dari Desa Cibenda.`,
          };
        }

        if (
          magnitude >= ALERT_RULES.earthquake.monitoringMagnitude &&
          radius <= ALERT_RULES.radius.HIGH
        ) {
          return {
            level: AlertLevel.YELLOW,
            source: "BMKG",
            description: `Gempa M${magnitude} terdeteksi dalam radius ${radius} km dari Desa Cibenda. Tingkatkan kewaspadaan dan pantau informasi resmi BMKG.`,
          };
        }
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