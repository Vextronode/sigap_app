import { EarthquakeService } from "./earthquake.service.js";
import { DecisionEngineService } from "./decisionEngine.service.js";

import type {
  CurrentAlert,
  EarthquakeStatus,
} from "../types/alert.types.js";

export class AlertStatusService {
  /**
   * Menghasilkan status alert berdasarkan data gempa terbaru BMKG.
   */
  static async getCurrentAlert(): Promise<CurrentAlert> {
    try {
      // Ambil data gempa terbaru
      const earthquake = await EarthquakeService.getLatest();

      // Hasil dari Decision Engine
      const result =
        DecisionEngineService.evaluateFromEarthquake(earthquake);

      // Konversi ke CurrentAlert
      return {
        level: result.level,
        title: `Status ${result.level}`,
        description: result.description,
        recommendation: this.getRecommendation(result.level),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[AlertStatusService] getCurrentAlert:", error);
      throw error;
    }
  }

  /**
   * Status earthquake.
   */
  static async getEarthquakeStatus(): Promise<EarthquakeStatus> {
    return {
      status: "NORMAL",
      warningLevel: "NONE",
      source: "BMKG InaTEWS",
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Rekomendasi tindakan berdasarkan level alert.
   */
  private static getRecommendation(level: string): string {
    switch (level) {
      case "RED":
        return "Segera lakukan evakuasi sesuai prosedur.";

      case "ORANGE":
        return "Bersiap untuk evakuasi dan ikuti informasi resmi.";

      case "YELLOW":
        return "Tetap waspada dan pantau informasi BMKG.";

      case "GREEN":
      default:
        return "Kondisi aman.";
    }
  }
}