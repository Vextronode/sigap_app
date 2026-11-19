/**
 * Types untuk integrasi Sistem Informasi Desa (SIDUTama API)
 * Berdasarkan kontrak openapi.yaml dan spesifikasi sid-sigap.md (v1.0.0, 16 November 2026)
 */

export type SidAlertType = "gempa" | "tsunami";

export type SidAlertLevel = "info" | "waspada" | "siaga" | "awas";

export type SidAlertStatus = "active" | "dismissed" | "ended" | "expired";

export interface SidAlertInput {
  type: SidAlertType;
  level: SidAlertLevel;
  title: string;
  message?: string | null;
  occurred_at: string; // ISO 8601
  sent_at: string;     // ISO 8601
  expires_at?: string | null; // ISO 8601
  magnitude?: number | null;
  depth_km?: number | null;
  location?: string | null;
  link_url?: string | null;
}

export interface SidAlertReceipt {
  external_id: string;
  status: SidAlertStatus;
  level: SidAlertLevel;
  expires_at: string;
  received_at: string;
}

export interface SidPingResult {
  client: string;
  abilities: string[];
  server_time: string;
}

export type SidErrorCode = "integration_disabled" | "ability_forbidden" | "too_many_attempts";

export interface SidErrorResponse {
  message: string;
  code?: SidErrorCode;
  errors?: Record<string, string[]>;
}

export interface SidDispatchResult {
  ok: boolean;
  statusCode: number;
  data?: SidAlertReceipt | SidPingResult;
  error?: string;
  code?: SidErrorCode;
  retryAfterSeconds?: number;
  retryable: boolean;
}

export interface SidQueueItem {
  id: string;
  externalId: string;
  action: "upsert" | "end";
  payload?: SidAlertInput;
  attempts: number;
  maxAttempts: number;
  nextRetryAt: number;
  createdAt: number;
  lastError?: string;
  lastStatusCode?: number;
}
