/**
 * Mapper dan Sanitizer Payload untuk Integrasi SIDUTama API
 * Memastikan payload yang dikirim dari SIGAP 100% mematuhi schema openapi.yaml
 */

import { AlertLevel } from "../../generated/prisma/enums.js";
import type { DecisionResult } from "../types/alert.types.js";
import type { EarthquakeInfo } from "../types/earthquake.types.js";
import type {
  SidAlertInput,
  SidAlertLevel,
  SidAlertType,
} from "../types/sidIntegration.types.js";

const DEFAULT_EXPIRATION_HOURS = 6;
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
 * Format string tanggal ke ISO 8601 valid
 */
export function toIsoDateTime(dateValue?: string | Date | null): string {
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
 * Menyusun pesan arahan keselamatan bagi warga sesuai level ancaman
 */
export function buildActionMessage(
  level: SidAlertLevel,
  type: SidAlertType,
  customDescription?: string | null
): string {
  let defaultGuidance: string;
  if (type === "tsunami") {
    if (level === "awas") {
      defaultGuidance =
        "Status AWAS: Segera evakuasi menjauhi pesisir pantai menuju titik kumpul atau dataran tinggi melalui jalur evakuasi resmi Desa Cibenda.";
    } else if (level === "siaga") {
      defaultGuidance =
        "Status SIAGA: Bersiap untuk evakuasi cepat. Jauhi bibir pantai dan bantaran sungai, serta perhatikan arahan pengeras suara perangkat posko.";
    } else {
      defaultGuidance =
        "Status WASPADA: Waspada terhadap perubahan ketinggian muka air laut di pesisir. Jangan beraktivitas di sekitar pantai.";
    }
  } else {
    // Gempa bumi
    if (level === "awas" || level === "siaga") {
      defaultGuidance =
        "Guncangan kuat dirasakan di sekitar desa. Hindari bangunan retak, tiang listrik, dan lereng rawan longsor. Menuju lapangan terbuka dan ikuti arahan petugas desa.";
    } else if (level === "waspada") {
      defaultGuidance =
        "Tetap tenang, periksa kondisi tempat tinggal Anda, jauhi benda gantung, dan pantau pembaruan berkala dari posko siaga.";
    } else {
      defaultGuidance =
        "Informasi gempa termonitor di sekitar wilayah Jawa Barat/Pangandaran. Tidak ada indikasi dampak langsung di Desa Cibenda.";
    }
  }

  const combined = customDescription
    ? `${customDescription.trim()} ${defaultGuidance}`
    : defaultGuidance;

  return combined.length > MAX_MESSAGE_LENGTH
    ? combined.slice(0, MAX_MESSAGE_LENGTH - 3) + "..."
    : combined;
}

/**
 * Membangun judul ringkas yang informatif (max 150 char)
 */
export function buildAlertTitle(
  level: SidAlertLevel,
  type: SidAlertType,
  magnitude?: number | null,
  location?: string | null
): string {
  const levelPrefix = `[${level.toUpperCase()}]`;
  let title: string;

  if (type === "tsunami") {
    title = `${levelPrefix} Peringatan Dini Tsunami Pesisir Selatan Jawa Barat`;
  } else {
    const magText = magnitude ? ` M${magnitude}` : "";
    const locText = location ? ` di ${location}` : " di Sekitar Desa Cibenda";
    title = `${levelPrefix} Gempa Bumi${magText}${locText}`;
  }

  return title.length > MAX_TITLE_LENGTH
    ? title.slice(0, MAX_TITLE_LENGTH - 3) + "..."
    : title;
}

/**
 * Sanitasi string external_id sesuai pattern regex openapi: ^[A-Za-z0-9._:-]{1,100}$
 */
export function sanitizeExternalId(rawId: string): string {
  const cleaned = rawId.replace(/[^A-Za-z0-9._:-]/g, "-").slice(0, 100);
  return cleaned || `sigap-${Date.now()}`;
}

/**
 * Mapper utama: mengubah data event gempa / alert SIGAP menjadi SidAlertInput
 */
export interface MapToSidAlertOptions {
  alertRecord?: {
    id?: string | null;
    level?: AlertLevel | string;
    source?: string;
    description?: string | null;
    eventTime?: Date | string | null;
    referenceMagnitude?: number | null;
    episodeMaxMagnitude?: number | null;
    createdAt?: Date | string;
  } | null;
  decisionResult?: Partial<DecisionResult> | null;
  determiningEarthquake?: Partial<EarthquakeInfo> | null;
  publicBaseUrl?: string;
  externalId: string;
}

export function mapToSidAlertInput(options: MapToSidAlertOptions): SidAlertInput {
  const { alertRecord, decisionResult, determiningEarthquake, publicBaseUrl, externalId } = options;

  const rawLevel = alertRecord?.level ?? decisionResult?.level ?? AlertLevel.GREEN;
  const sidLevel = mapAlertLevelToSid(rawLevel);

  const rawSource = alertRecord?.source ?? decisionResult?.source ?? "";
  const isTsunami =
    /tsunami/i.test(rawSource) ||
    /tsunami/i.test(alertRecord?.description ?? "") ||
    /tsunami/i.test(decisionResult?.description ?? "");
  const sidType: SidAlertType = isTsunami ? "tsunami" : "gempa";

  const magnitude =
    determiningEarthquake?.magnitude ??
    alertRecord?.referenceMagnitude ??
    alertRecord?.episodeMaxMagnitude ??
    decisionResult?.sequence?.levelMaxMagnitude ??
    null;

  const depthKm = parseDepthKm(determiningEarthquake?.depth);

  let rawLocation = determiningEarthquake?.location ?? null;
  if (rawLocation && rawLocation.length > MAX_LOCATION_LENGTH) {
    rawLocation = rawLocation.slice(0, MAX_LOCATION_LENGTH - 3) + "...";
  }

  const title = buildAlertTitle(sidLevel, sidType, magnitude, rawLocation);

  const customDesc = alertRecord?.description ?? decisionResult?.description ?? null;
  const message = buildActionMessage(sidLevel, sidType, customDesc);

  const occurredAt = toIsoDateTime(
    alertRecord?.eventTime ??
    determiningEarthquake?.updatedAt ??
    decisionResult?.sequence?.eventTime ??
    alertRecord?.createdAt
  );

  const sentAt = new Date().toISOString();

  // Batas masa tayang: 6 jam setelah occurred_at
  const occurredTimestamp = new Date(occurredAt).getTime();
  const expiresAt = new Date(
    occurredTimestamp + DEFAULT_EXPIRATION_HOURS * 60 * 60 * 1000
  ).toISOString();

  const baseUrl = (publicBaseUrl || "https://sigap-berdampak.widyatama.ac.id").replace(/\/+$/, "");
  const linkUrl = `${baseUrl}/?view=warga#alert-${encodeURIComponent(externalId)}`;

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
