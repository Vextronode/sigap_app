/**
 * SidIntegrationService — Layanan integrasi server-to-server ke SIDUTama API
 * Mengimplementasikan pengiriman peringatan bencana (push), pengakhiran, ping healthcheck,
 * dan antrean pengulangan bertahap (exponential backoff) sesuai sid-sigap.md & openapi.yaml.
 */

import type {
  SidAlertInput,
  SidAlertReceipt,
  SidDispatchResult,
  SidErrorResponse,
  SidPingResult,
  SidQueueItem,
} from "../types/sidIntegration.types.js";

const DEFAULT_TIMEOUT_MS = 10_000; // Sesuai Bagian 9 sid-sigap.md: timeout ~10 detik
const RETRY_DELAYS_MS = [30_000, 120_000, 300_000]; // Jeda bertahap: 30s, 2m, 5m

export class SidIntegrationService {
  private static queue: Map<string, SidQueueItem> = new Map();
  private static activeExternalIds: Set<string> = new Set();
  private static isProcessing = false;
  private static timer: NodeJS.Timeout | null = null;
  private static lastDispatchResult: {
    ok: boolean;
    timestamp: string;
    error?: string;
  } | null = null;

  /**
   * Cek apakah integrasi SID sedang aktif dan memiliki kredensial
   */
  public static isConfigured(): boolean {
    const enabled =
      process.env.SID_INTEGRATION_ENABLED === "true" ||
      process.env.SID_INTEGRATION_ENABLED === "1";
    const baseUrl = process.env.SID_API_BASE_URL?.trim();
    const token = process.env.SID_API_TOKEN?.trim();
    return Boolean(enabled && baseUrl && token);
  }

  /**
   * Catat hasil transmisi terakhir untuk indikator SystemHealth
   */
  public static recordDispatchResult(ok: boolean, error?: string): void {
    this.lastDispatchResult = {
      ok,
      timestamp: new Date().toISOString(),
      error: ok ? undefined : error,
    };
  }

  /**
   * Baca hasil transmisi terakhir
   */
  public static getLastDispatchResult(): { ok: boolean; timestamp: string; error?: string } | null {
    return this.lastDispatchResult;
  }

  /**
   * Helper membaca konfigurasi dasar
   */
  private static getConfig() {
    const baseUrl = (process.env.SID_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
    const token = (process.env.SID_API_TOKEN ?? "").trim();
    const publicBaseUrl = (
      process.env.SIGAP_PUBLIC_BASE_URL ?? "https://sigap-berdampak.widyatama.ac.id"
    )
      .trim()
      .replace(/\/+$/, "");

    return { baseUrl, token, publicBaseUrl };
  }

  /**
   * Header resmi request ke SID (Bagian 4 sid-sigap.md)
   */
  private static buildHeaders(token: string): HeadersInit {
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  /**
   * Tes koneksi dan token ke SIDUTama (GET /ping)
   */
  public static async ping(): Promise<SidDispatchResult> {
    const { baseUrl, token } = this.getConfig();
    if (!baseUrl || !token) {
      return {
        ok: false,
        statusCode: 0,
        error: "Konfigurasi SID_API_BASE_URL atau SID_API_TOKEN belum diatur.",
        retryable: false,
      };
    }

    const url = `${baseUrl}/ping`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.buildHeaders(token),
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      });

      const bodyText = await response.text();
      let parsedJson: { data?: SidPingResult } & Partial<SidErrorResponse> = {};
      try {
        parsedJson = JSON.parse(bodyText);
      } catch {
        // non-json response
      }

      if (response.ok && parsedJson.data) {
        this.recordDispatchResult(true);
        return {
          ok: true,
          statusCode: response.status,
          data: parsedJson.data,
          retryable: false,
        };
      }

      const errMsg = parsedJson.message || `HTTP ${response.status}: ${response.statusText}`;
      this.recordDispatchResult(false, errMsg);

      return {
        ok: false,
        statusCode: response.status,
        error: errMsg,
        code: parsedJson.code,
        retryable: response.status >= 500,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.recordDispatchResult(false, message);
      return {
        ok: false,
        statusCode: 0,
        error: `Gagal menghubungi server SID: ${message}`,
        retryable: true,
      };
    }
  }

  /**
   * Kirim atau perbarui peringatan bencana (PUT /alerts/{external_id})
   */
  public static async sendAlert(
    externalId: string,
    payload: SidAlertInput
  ): Promise<SidDispatchResult> {
    const { baseUrl, token } = this.getConfig();
    if (!baseUrl || !token) {
      return {
        ok: false,
        statusCode: 0,
        error: "Konfigurasi SID belum lengkap.",
        retryable: false,
      };
    }

    const url = `${baseUrl}/alerts/${encodeURIComponent(externalId)}`;
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: this.buildHeaders(token),
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      });

      const bodyText = await response.text();
      let parsedJson: { data?: SidAlertReceipt } & Partial<SidErrorResponse> = {};
      try {
        parsedJson = JSON.parse(bodyText);
      } catch {
        // non-json response
      }

      // 200 (diperbarui) atau 201 (dibuat baru)
      if (response.ok && parsedJson.data) {
        return {
          ok: true,
          statusCode: response.status,
          data: parsedJson.data,
          retryable: false,
        };
      }

      // Cek apakah 429 Too Many Requests (Rate limit)
      let retryAfterSeconds: number | undefined;
      if (response.status === 429) {
        const retryAfterHeader = response.headers.get("Retry-After");
        if (retryAfterHeader) {
          const parsedSeconds = parseInt(retryAfterHeader, 10);
          if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
            retryAfterSeconds = parsedSeconds;
          }
        }
      }

      // Aturan retry: 401, 403, 422 JANGAN diulang (format salah / token rusak)
      // 429 dan 5xx boleh diulang
      const isRetryable = response.status === 429 || response.status >= 500;

      return {
        ok: false,
        statusCode: response.status,
        error: parsedJson.message || `HTTP ${response.status}: ${response.statusText}`,
        code: parsedJson.code,
        retryAfterSeconds,
        retryable: isRetryable,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        statusCode: 0,
        error: `Timeout atau jaringan gagal: ${message}`,
        retryable: true,
      };
    }
  }

  /**
   * Akhiri peringatan bencana (POST /alerts/{external_id}/end)
   */
  public static async endAlert(externalId: string): Promise<SidDispatchResult> {
    const { baseUrl, token } = this.getConfig();
    if (!baseUrl || !token) {
      return {
        ok: false,
        statusCode: 0,
        error: "Konfigurasi SID belum lengkap.",
        retryable: false,
      };
    }

    const url = `${baseUrl}/alerts/${encodeURIComponent(externalId)}/end`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.buildHeaders(token),
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      });

      const bodyText = await response.text();
      let parsedJson: { data?: SidAlertReceipt } & Partial<SidErrorResponse> = {};
      try {
        parsedJson = JSON.parse(bodyText);
      } catch {
        // non-json response
      }

      // 200 sukses diakhiri, 404 dianggap sukses karena alert memang sudah tiada di SID
      if (response.ok || response.status === 404) {
        return {
          ok: true,
          statusCode: response.status,
          data: parsedJson.data,
          retryable: false,
        };
      }

      // 429 dan 5xx boleh diulang
      const isRetryable = response.status === 429 || response.status >= 500;

      return {
        ok: false,
        statusCode: response.status,
        error: parsedJson.message || `HTTP ${response.status}: ${response.statusText}`,
        code: parsedJson.code,
        retryable: isRetryable,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        statusCode: 0,
        error: `Timeout atau jaringan gagal: ${message}`,
        retryable: true,
      };
    }
  }

  /**
   * Antrekan pengiriman peringatan secara asinkron (non-blocking)
   */
  public static enqueueAlert(externalId: string, payload: SidAlertInput): void {
    if (!this.isConfigured()) {
      return;
    }

    this.activeExternalIds.add(externalId);

    const item: SidQueueItem = {
      id: `upsert-${externalId}`,
      externalId,
      action: "upsert",
      payload,
      attempts: 0,
      maxAttempts: RETRY_DELAYS_MS.length + 1,
      nextRetryAt: Date.now(),
      createdAt: Date.now(),
    };

    this.queue.set(item.id, item);
    this.scheduleProcessQueue(0);
  }

  /**
   * Antrekan pengakhiran peringatan secara asinkron (non-blocking)
   * Sekaligus membuang item upsert pending untuk externalId ini jika masih ada di antrean
   */
  public static enqueueEndAlert(externalId: string): void {
    if (!this.isConfigured()) {
      return;
    }

    // Buang item upsert untuk externalId ini bila masih ada di antrean
    this.queue.delete(`upsert-${externalId}`);
    this.activeExternalIds.delete(externalId);

    const item: SidQueueItem = {
      id: `end-${externalId}`,
      externalId,
      action: "end",
      attempts: 0,
      maxAttempts: RETRY_DELAYS_MS.length + 1,
      nextRetryAt: Date.now(),
      createdAt: Date.now(),
    };

    this.queue.set(item.id, item);
    this.scheduleProcessQueue(0);
  }

  /**
   * Mengambil daftar externalId yang tercatat aktif di SID
   */
  public static getActiveExternalIds(): string[] {
    return Array.from(this.activeExternalIds);
  }

  /**
   * Mengakhiri semua peringatan yang tercatat aktif di SID
   */
  public static endAllActiveAlerts(): void {
    for (const externalId of Array.from(this.activeExternalIds)) {
      this.enqueueEndAlert(externalId);
    }
  }

  /**
   * Mengatur jadwal eksekusi pemrosesan antrean
   */
  private static scheduleProcessQueue(delayMs: number): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.timer = setTimeout(() => {
      this.processQueue().catch((err) => {
        console.error("[SidIntegration] Error tak terduga saat proses antrean:", err);
      });
    }, delayMs);

    // Jangan biarkan timer menggantung proses node saat shutdown
    if (this.timer.unref) {
      this.timer.unref();
    }
  }

  /**
   * Memproses antrean pesan secara serial dan menghormati backoff
   */
  public static async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.size === 0) {
      return;
    }

    this.isProcessing = true;
    const now = Date.now();
    let nextCheckDelayMs: number | null = null;

    try {
      for (const [id, item] of Array.from(this.queue.entries())) {
        // Cek apakah masa tayang sudah habis (Bagian 9: berhenti mengulang jika lewat masa tayang)
        if (item.payload?.expires_at) {
          const expiresTime = new Date(item.payload.expires_at).getTime();
          if (now > expiresTime) {
            console.warn(
              `[SidIntegration] Peringatan ${item.externalId} dibatalkan dari antrean karena telah lewat masa tayang (expired).`
            );
            if (this.queue.get(id) === item) {
              this.queue.delete(id);
            }
            continue;
          }
        }

        // Cek apakah belum saatnya retry
        if (item.nextRetryAt > now) {
          const diff = item.nextRetryAt - now;
          if (nextCheckDelayMs === null || diff < nextCheckDelayMs) {
            nextCheckDelayMs = diff;
          }
          continue;
        }

        item.attempts += 1;
        let result: SidDispatchResult;

        if (item.action === "upsert" && item.payload) {
          result = await this.sendAlert(item.externalId, item.payload);
        } else {
          result = await this.endAlert(item.externalId);
        }

        if (result.ok) {
          console.log(
            `[SidIntegration] Sukses mengirim ${item.action} ke SID (${item.externalId}). Status: HTTP ${result.statusCode}`
          );
          this.recordDispatchResult(true);
          if (this.queue.get(id) === item) {
            this.queue.delete(id);
          }
        } else {
          item.lastError = result.error;
          item.lastStatusCode = result.statusCode;

          console.warn(
            `[SidIntegration] Gagal mengirim ${item.action} ke SID (${item.externalId}): ${result.error} (percobaan ke-${item.attempts}/${item.maxAttempts})`
          );

          // Jika non-retryable atau sudah mencapai batas maksimal percobaan
          if (!result.retryable || item.attempts >= item.maxAttempts) {
            console.error(
              `[SidIntegration] Menghentikan pengulangan untuk ${item.externalId}. Alasan: ${
                !result.retryable ? "Error permanen (non-retryable)" : "Batas percobaan terlampaui"
              }`
            );
            this.recordDispatchResult(false, result.error);
            if (this.queue.get(id) === item) {
              this.queue.delete(id);
            }
          } else {
            // Tentukan jeda percobaan berikutnya
            let delayMs = RETRY_DELAYS_MS[item.attempts - 1] ?? 300_000;
            if (result.retryAfterSeconds && result.retryAfterSeconds > 0) {
              delayMs = result.retryAfterSeconds * 1000;
            }
            item.nextRetryAt = Date.now() + delayMs;

            if (nextCheckDelayMs === null || delayMs < nextCheckDelayMs) {
              nextCheckDelayMs = delayMs;
            }
          }
        }
      }
    } finally {
      this.isProcessing = false;
      if (this.queue.size > 0) {
        const currentTime = Date.now();
        let earliestDelay = nextCheckDelayMs;
        for (const queued of this.queue.values()) {
          const delay = Math.max(0, queued.nextRetryAt - currentTime);
          if (earliestDelay === null || delay < earliestDelay) {
            earliestDelay = delay;
          }
        }
        this.scheduleProcessQueue(earliestDelay ?? 0);
      }
    }
  }

  /**
   * Helper diagnostik: mengetahui kondisi antrean saat ini
   */
  public static getStatus() {
    return {
      enabled: this.isConfigured(),
      activeExternalIds: Array.from(this.activeExternalIds),
      lastDispatchResult: this.lastDispatchResult,
      queueSize: this.queue.size,
      items: Array.from(this.queue.values()).map((q) => ({
        id: q.id,
        externalId: q.externalId,
        action: q.action,
        attempts: q.attempts,
        maxAttempts: q.maxAttempts,
        nextRetryAt: new Date(q.nextRetryAt).toISOString(),
        lastError: q.lastError,
        lastStatusCode: q.lastStatusCode,
      })),
    };
  }

  /**
   * Reset antrean (untuk pengujian/testing)
   */
  public static clearQueueForTest(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.queue.clear();
    this.activeExternalIds.clear();
    this.isProcessing = false;
    this.lastDispatchResult = null;
  }
}
