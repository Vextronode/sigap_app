import { AlertLevel } from "../../generated/prisma/enums.js";
import type { EarthquakeInfo } from "./earthquake.types.js";

export type TsunamiStatus = "NORMAL" | "WASPADA" | "SIAGA" | "AWAS";

/**
 * Hasil status tsunami lengkap dengan `source`/`description` yang jujur
 * tentang asalnya — bisa dari override manual (resmi InaTEWS) atau hasil
 * estimasi otomatis SIGAP sendiri (lihat BmkgService.getTsunamiStatus()).
 * Dipakai apa adanya oleh Decision Engine supaya deskripsi yang sampai ke
 * alert dashboard tidak pernah mengaku-ngaku sebagai data resmi BMKG kalau
 * sebenarnya cuma estimasi.
 */
export interface TsunamiStatusInfo {
  status: TsunamiStatus;
  source: string;
  description: string;
}

export interface DecisionInput {
  earthquake?: EarthquakeInfo | null;

  tsunami?: TsunamiStatusInfo | null;
}

export interface DecisionResult {
  level: AlertLevel;
  source: string;
  description: string;
}

export interface AlertRecord {
  id: string;
  level: AlertLevel;
  source: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
