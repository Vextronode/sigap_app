/** Interval Unit Utama memanggil GET /device/status (ADR-013, ADR-052). */
export const DEVICE_POLL_INTERVAL_MS = 15_000;

/** Perangkat dianggap offline setelah 3 poll berturut-turut tidak masuk (ADR-052). */
export const DEVICE_OFFLINE_THRESHOLD_MS = 3 * DEVICE_POLL_INTERVAL_MS;

/** lastSeen dicatat di memori setiap laporan, ditulis ke database paling sering sekali per interval ini (ADR-052). */
export const DEVICE_LAST_SEEN_PERSIST_INTERVAL_MS = 60_000;
