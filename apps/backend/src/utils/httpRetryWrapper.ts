/**
 * Generic HTTP request wrapper (pakai axios, sesuai dependency project)
 * dengan retry (exponential backoff) + fallback.
 * Reusable untuk semua service HTTP client, bukan cuma BMKG.
 *
 * Task: BE - Wrapper request retry/fallback
 */

import axios, { AxiosError, AxiosRequestConfig } from "axios";

export interface RetryOptions {
  /** Jumlah percobaan ulang setelah request pertama gagal. Default: 3 */
  retries?: number;
  /** Delay awal sebelum retry, dalam ms. Default: 500 */
  retryDelayMs?: number;
  /** Faktor pengali delay tiap retry (exponential backoff). Default: 2 */
  backoffFactor?: number;
  /** Timeout per-request, dalam ms. Default: 8000 */
  timeoutMs?: number;
  /** Callback opsional, dipanggil setiap kali retry terjadi (mis. untuk logging) */
  onRetry?: (attempt: number, error: unknown) => void;
}

export class HttpRequestError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly attempts?: number,
    public readonly status?: number
  ) {
    super(message);
    this.name = "HttpRequestError";
  }
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, "onRetry">> = {
  retries: 3,
  retryDelayMs: 500,
  backoffFactor: 2,
  timeoutMs: 8000,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Request dengan retry otomatis (exponential backoff) + timeout per-attempt.
 * Throw HttpRequestError kalau semua percobaan gagal.
 */
export async function requestWithRetry<T = unknown>(
  url: string,
  config: AxiosRequestConfig = {},
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const maxAttempts = opts.retries + 1;
  let lastError: unknown;
  let delay = opts.retryDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await axios.request<T>({
        url,
        timeout: opts.timeoutMs,
        ...config,
      });
      return response.data;
    } catch (error) {
      lastError = error;

      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const isLastAttempt = attempt === maxAttempts;
      // Jangan retry untuk client error (4xx selain 429) — bukan error transient
      const isNonRetryableClientError =
        typeof status === "number" && status >= 400 && status < 500 && status !== 429;

      if (isLastAttempt || isNonRetryableClientError) {
        throw new HttpRequestError(
          `Request ke ${url} gagal${status ? ` (status ${status})` : ""} setelah ${attempt} percobaan`,
          lastError,
          attempt,
          status
        );
      }

      options.onRetry?.(attempt, error);
      await sleep(delay);
      delay *= opts.backoffFactor;
    }
  }

  // Tidak akan ketemu, tapi TypeScript butuh ini
  throw new HttpRequestError(`Request ke ${url} gagal`, lastError, maxAttempts);
}

/**
 * Sama seperti requestWithRetry, tapi kalau tetap gagal setelah semua retry,
 * kembalikan nilai fallback alih-alih throw. Cocok dipakai di service yang
 * datanya boleh "stale/default" saat API eksternal down (mis. BMKG down).
 */
export async function requestWithFallback<T>(
  url: string,
  fallback: T | (() => T | Promise<T>),
  config: AxiosRequestConfig = {},
  options: RetryOptions = {}
): Promise<{ data: T; fromFallback: boolean }> {
  try {
    const data = await requestWithRetry<T>(url, config, options);
    return { data, fromFallback: false };
  } catch (error) {
    console.error(
      `[requestWithFallback] Gagal ambil data dari ${url}, pakai fallback. Alasan:`,
      error instanceof Error ? error.message : error
    );
    const data =
      typeof fallback === "function"
        ? await (fallback as () => T | Promise<T>)()
        : fallback;
    return { data, fromFallback: true };
  }
}
