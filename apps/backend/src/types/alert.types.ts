import { AlertLevel, AlertReviewStatus } from "../../generated/prisma/enums.js";
import type { EarthquakeInfo } from "./earthquake.types.js";

export { AlertReviewStatus };

/**
 * Level alert yang berlaku. UNKNOWN hanya menggambarkan kondisi saat data tidak
 * tersedia dan tidak pernah disimpan ke database (ADR-037).
 */
export type CurrentAlertLevel = AlertLevel | "UNKNOWN";

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
  /** Gempa relevan; yang berumur lebih dari 24 jam diabaikan Decision Engine. */
  earthquakes?: EarthquakeInfo[] | null;
  tsunami?: TsunamiStatusInfo | null;
}

/** Ringkasan rentetan gempa aktif yang menentukan level (ADR-046). */
export interface EarthquakeSequence {
  /** Kejadian terbaru pada level tertinggi; dasar masa aktif alert. */
  eventTime: string;
  eventMagnitude: number;
  /** Magnitudo terbesar pada level tertinggi; dasar aturan notifikasi rentetan. */
  levelMaxMagnitude: number;
  startedAt: string;
  eventCount: number;
  maxMagnitude: number;
}

export interface DecisionResult {
  level: AlertLevel;
  source: string;
  description: string;
  /** Terisi bila level berasal dari gempa. */
  sequence?: EarthquakeSequence;
}

// label status review dalam bahasa indonesia sesuai spesifikasi fs-02
export type AlertReviewStatusLabel =
  | "Belum Diverifikasi"
  | "Belum Ditinjau"
  | "Dikonfirmasi"
  | "Ditolak"
  | "Ditindaklanjuti";

// status yang diperbolehkan saat admin/operator melakukan aksi review
export type AlertReviewableStatus =
  | "Dikonfirmasi"
  | "Ditolak"
  | "Ditindaklanjuti";

export interface AlertReviewerInfo {
  id: string;
  name: string;
  email: string;
  roles?: string[];
}

export interface AlertRecord {
  id: string;
  level: CurrentAlertLevel;
  source: string;
  description: string | null;
  location?: string | null;
  shakemap?: string | null;
  reviewStatus: AlertReviewStatusLabel;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  reviewer?: AlertReviewerInfo | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertFilterQuery {
  page?: number;
  limit?: number;
  severity?: AlertLevel;
  reviewStatus?: AlertReviewStatusLabel | AlertReviewStatus;
  startDate?: string;
  endDate?: string;
}

export interface ReviewAlertPayload {
  reviewStatus: AlertReviewableStatus;
}

export interface AlertListPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

