/**
 * Mapper dan Sanitizer Payload untuk Integrasi SIDUTama API
 * Memastikan payload yang dikirim dari SIGAP 100% mematuhi schema openapi.yaml
 */

import { AlertLevel } from "../../generated/prisma/enums.js";
import { OFFICIAL_TSUNAMI_SOURCE } from "../config/alertRules.js";
import { alertActiveUntil } from "./alert.service.js";
import type { EarthquakeInfo } from "../types/earthquake.types.js";
import type {
  SidAlertInput,
  SidAlertLevel,
  SidAlertType,
} from "../types/sidIntegration.types.js";

const MAX_TITLE_LENGTH = 150;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_LOCATION_LENGTH = 150;

/**
 * Pemetaan AlertLevel SIGAP ke SidAlertLevel (openapi.yaml enum: info, waspada, siaga, awas)
 */
export function mapAlertLevelToSid(level: AlertLevel | string): SidAlertLevel {
  switch (level) {
    case AlertLevel.RED:
    case "RED":
    case "AWAS":
      return "awas";
    case AlertLevel.ORANGE:
    case "ORANGE":
    case "SIAGA":
      return "siaga";
    case AlertLevel.YELLOW:
    case "YELLOW":
    case "WASPADA":
      return "waspada";
    case AlertLevel.GREEN:
    case "GREEN":
    case "AMAN":
    default:
      return "info";
  }
}

/**
 * Parsing teks kedalaman BMKG (contoh "18 km" atau "10km") menjadi angka km
 */
export function parseDepthKm(depthStr?: string | null): number | null {
  if (!depthStr) return null;
  const match = depthStr.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const val = parseFloat(match[1]);
  return Number.isFinite(val) && val >= 0 ? val : null;
}

/**
 * Ekstrak magnitudo dari teks deskripsi (contoh: "Gempa M5.2 ...")
 */
export function parseMagnitude(description?: string | null): number | null {
  const match = description?.match(/M(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

/**
 * Format string tanggal ke ISO 8601 valid
 */
export function toIsoDateTime(dateValue?: string | number | Date | null): string {
  if (!dateValue) return new Date().toISOString();
  try {
    const d = new Date(dateValue);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {
    // fallback
  }
  return new Date().toISOString();
}

/**
 * Sanitasi string external_id sesuai pattern regex openapi: ^[A-Za-z0-9._:-]{1,100}$
 */
export function sanitizeExternalId(rawId: string): string {
  const cleaned = rawId.replace(/[^A-Za-z0-9._:-]/g, "-").slice(0, 100);
  return cleaned || `sigap-${Date.now()}`;
}

/**
 * Membuat external_id berdasarkan jenis bencana dan waktu kejadian/awal episode.
 * Gempa: gempa-<episodeStartedAt>, Tsunami: tsunami-<eventTime>
 */
export function buildSidExternalId(
  type: SidAlertType,
  timeValue?: string | number | Date | null
): string {
  const iso = toIsoDateTime(timeValue);
  return sanitizeExternalId(`${type}-${iso}`);
}

/**
 * Parameter untuk pemetaan data alert SIGAP ke SidAlertInput
 */
export interface MapToSidAlertOptions {
  alert: {
    id?: string | null;
    level: AlertLevel | string;
    source: string;
    description?: string | null;
    eventTime?: Date | string | null;
    episodeStartedAt?: Date | string | null;
    createdAt?: Date | string;
    activeUntil?: Date | string | null;
  };
  notification: {
    payload: {
      title: string;
      body: string;
    };
  };
  determiningEarthquake?: Partial<EarthquakeInfo> | null;
  publicBaseUrl?: string;
  externalId: string;
  now?: Date;
}

/**
 * Mapper utama: mengubah data event/notifikasi SIGAP menjadi SidAlertInput
 * Mengembalikan null jika masa aktif alert sudah habis (mencegah HTTP 422 dari SID)
 */
export function mapToSidAlertInput(options: MapToSidAlertOptions): SidAlertInput | null {
  const { alert, notification, determiningEarthquake, publicBaseUrl, now = new Date() } = options;

  const sidLevel = mapAlertLevelToSid(alert.level);

  const isTsunami =
    /tsunami/i.test(alert.source) ||
    /tsunami/i.test(alert.description ?? "");
  const sidType: SidAlertType = isTsunami ? "tsunami" : "gempa";

  // Waktu kejadian fisik
  const occurredAt = toIsoDateTime(
    alert.eventTime ??
    determiningEarthquake?.updatedAt ??
    alert.episodeStartedAt ??
    alert.createdAt
  );

  const sentAt = now.toISOString();

  // Hitung expires_at:
  // - Tsunami resmi: sekarang + 24 jam (diperbarui via PUT selama aktif, diakhiri /end saat dicabut)
  // - Gempa dan estimasi tsunami: alertActiveUntil(alert).
  // Jangan kirim bila sudah lewat (SID membalas 422).
  let expiresAt: string;
  if (alert.source === OFFICIAL_TSUNAMI_SOURCE) {
    expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  } else {
    let untilDate: Date | null = null;
    if (alert.activeUntil) {
      const parsed = new Date(alert.activeUntil);
      if (!isNaN(parsed.getTime())) untilDate = parsed;
    }
    if (!untilDate) {
      untilDate = alertActiveUntil({
        source: alert.source,
        eventTime: alert.eventTime ? new Date(alert.eventTime) : null,
        createdAt: alert.createdAt ? new Date(alert.createdAt) : new Date(occurredAt),
      });
    }

    if (untilDate) {
      if (untilDate.getTime() <= now.getTime()) {
        return null; // Sudah lewat, jangan kirim!
      }
      expiresAt = untilDate.toISOString();
    } else {
      // Fallback 6 jam sejak occurredAt bila alertActiveUntil null
      const fallbackUntil = new Date(new Date(occurredAt).getTime() + 6 * 60 * 60 * 1000);
      if (fallbackUntil.getTime() <= now.getTime()) {
        return null;
      }
      expiresAt = fallbackUntil.toISOString();
    }
  }

  // Pesan sama persis dengan notifikasi SIGAP (NotificationService.buildNotification)
  const title = notification.payload.title.trim().slice(0, MAX_TITLE_LENGTH);
  const message = notification.payload.body.trim().slice(0, MAX_MESSAGE_LENGTH);

  const magnitude =
    determiningEarthquake?.magnitude !== undefined && determiningEarthquake.magnitude !== null
      ? Number(determiningEarthquake.magnitude.toFixed(1))
      : parseMagnitude(alert.description);

  const depthKm = parseDepthKm(determiningEarthquake?.depth);

  let rawLocation = determiningEarthquake?.location ?? null;
  if (rawLocation && rawLocation.length > MAX_LOCATION_LENGTH) {
    rawLocation = rawLocation.slice(0, MAX_LOCATION_LENGTH - 3) + "...";
  }

  // URL bersih tanpa anchor hash (#alert-...)
  const baseUrl = (publicBaseUrl || process.env.SIGAP_PUBLIC_BASE_URL || "https://sigap-berdampak.widyatama.ac.id").replace(/\/+$/, "");
  const linkUrl = `${baseUrl}/?view=warga`;

  return {
    type: sidType,
    level: sidLevel,
    title,
    message,
    occurred_at: occurredAt,
    sent_at: sentAt,
    expires_at: expiresAt,
    magnitude: magnitude !== null && magnitude !== undefined ? Number(magnitude.toFixed(1)) : null,
    depth_km: depthKm,
    location: rawLocation,
    link_url: linkUrl,
  };
}
