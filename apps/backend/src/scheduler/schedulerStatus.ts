/**
 * Status siklus scheduler alert di memori proses (TK-04). Dicatat oleh runAlertCheck,
 * baik dari scheduler internal maupun pemicu `run-scheduler`, sehingga cron eksternal
 * juga terpantau.
 */

export type SchedulerState = "MEMULAI" | "AKTIF" | "TERLAMBAT" | "GAGAL" | "TIDAK_AKTIF";

/** Tanpa siklus sukses selama kelipatan interval ini, scheduler dianggap terlambat (ditetapkan Tech Lead). */
export const SCHEDULER_STALE_INTERVALS = 3;

export interface SchedulerCycleResult {
  level: string;
  saved: boolean;
  extended?: boolean;
}

export interface SchedulerStatus {
  state: SchedulerState;
  enabled: boolean;
  intervalMs: number;
  running: boolean;
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  consecutiveFailures: number;
  lastResult: SchedulerCycleResult | null;
}

const toIso = (ms: number | null) => (ms === null ? null : new Date(ms).toISOString());

let config = { enabled: false, intervalMs: 60_000 };
let startedAt = Date.now();
let running = false;
let lastRunAt: number | null = null;
let lastSuccessAt: number | null = null;
let consecutiveFailures = 0;
let lastResult: SchedulerCycleResult | null = null;

/** Dipanggil saat backend start, termasuk bila scheduler internal tidak aktif. */
export const configureSchedulerStatus = (next: { enabled: boolean; intervalMs: number }) => {
  config = next;
};

export const markCycleStarted = () => {
  running = true;
  lastRunAt = Date.now();
};

export const markCycleFinished = (ok: boolean, result?: SchedulerCycleResult) => {
  running = false;
  if (ok) {
    lastSuccessAt = Date.now();
    consecutiveFailures = 0;
    lastResult = result ?? null;
  } else {
    consecutiveFailures++;
  }
};

const computeState = (now: number): SchedulerState => {
  const windowMs = SCHEDULER_STALE_INTERVALS * config.intervalMs;
  if (consecutiveFailures > 0) return "GAGAL";
  if (lastSuccessAt !== null && now - lastSuccessAt <= windowMs) return "AKTIF";
  if (lastSuccessAt === null) {
    if (!config.enabled) return "TIDAK_AKTIF";
    return now - startedAt <= windowMs ? "MEMULAI" : "TERLAMBAT";
  }
  return "TERLAMBAT";
};

export const getSchedulerStatus = (now = Date.now()): SchedulerStatus => ({
  state: computeState(now),
  enabled: config.enabled,
  intervalMs: config.intervalMs,
  running,
  lastRunAt: toIso(lastRunAt),
  lastSuccessAt: toIso(lastSuccessAt),
  consecutiveFailures,
  lastResult,
});

/**
 * Scheduler dianggap sehat saat sedang menjalankan siklus, baru dimulai, atau
 * siklus sukses terakhir masih dalam batas. Selain itu banner dihitung langsung
 * dari BMKG (TK-04).
 */
export const isSchedulerHealthy = (now = Date.now()): boolean => {
  if (running) return true;
  const state = computeState(now);
  return state === "AKTIF" || state === "MEMULAI";
};

/** Untuk tes: mengembalikan status ke kondisi proses baru dimulai. */
export const resetSchedulerStatus = () => {
  startedAt = Date.now();
  running = false;
  lastRunAt = null;
  lastSuccessAt = null;
  consecutiveFailures = 0;
  lastResult = null;
};
