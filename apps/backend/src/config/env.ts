import { isIP } from "node:net";
import { z } from "zod";
import { DB_SSL_MODES, parseAllowedOrigins } from "./runtimeOptions.js";

/**
 * DEPLOY-01 (FR-A8): Validasi environment saat startup (fail-fast).
 *
 * Dipanggil paling awal di server.ts, sebelum modul yang membaca env di top-level
 * di-import. Cakupannya hanya VALIDASI: modul lain tetap membaca process.env sendiri.
 * Pesan error hanya memuat NAMA variabel dan alasannya, tidak pernah nilainya.
 */

interface EnvIssue {
  name: string;
  message: string;
}

const TRUST_PROXY_PRESETS = ["loopback", "linklocal", "uniquelocal"];

// String kosong diperlakukan sama dengan tidak di-set.
const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalInt = (min = 0) =>
  z.preprocess(
    blankToUndefined,
    z
      .string()
      .trim()
      .regex(/^\d+$/, "harus berupa bilangan bulat")
      .refine((value) => Number(value) >= min, `harus >= ${min}`)
      .optional()
  );

const optionalNumber = z.preprocess(
  blankToUndefined,
  z
    .string()
    .trim()
    .refine((value) => Number.isFinite(Number(value)), "harus berupa angka")
    .optional()
);

/**
 * Format variabel opsional (hanya dicek bila di-set).
 */
const formatSchema = z.object({
  DB_SSL: z.preprocess(
    blankToUndefined,
    z.enum(DB_SSL_MODES, `harus salah satu dari: ${DB_SSL_MODES.join(", ")}`).optional()
  ),
  DB_POOL_MAX: optionalInt(1),
  DB_POOL_IDLE_MS: optionalInt(),

  VILLAGE_LAT: optionalNumber,
  VILLAGE_LON: optionalNumber,

  PORT: optionalInt(),
  ALERT_SCHEDULER_INTERVAL_MS: optionalInt(15_000),
  SHUTDOWN_TIMEOUT_MS: optionalInt(),
  EARTHQUAKE_CACHE_TTL_MS: optionalInt(),
  HTTP_TIMEOUT_MS: optionalInt(),
  HTTP_RETRY_DELAY_MS: optionalInt(),
  HTTP_RETRY_COUNT: optionalInt(),
  PANGANDARAN_RADIUS_KM: optionalInt(),
  WEST_JAVA_RADIUS_KM: optionalInt(),
  PANGANDARAN_MAX_AGE_DAYS: optionalInt(),
  WEST_JAVA_MAX_AGE_DAYS: optionalInt(),
});

const REQUIRED_ALWAYS = ["DATABASE_URL", "JWT_SECRET", "CRON_SECRET"] as const;
const REQUIRED_IN_PRODUCTION = [
  "VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_SUBJECT",
  "DEVICE_SHARED_KEY",
  "JWT_ISSUER",
  "JWT_AUDIENCE",
] as const;

function isValidTrustProxyEntry(entry: string): boolean {
  if (TRUST_PROXY_PRESETS.includes(entry)) return true;
  const [address, prefix, ...rest] = entry.split("/");
  const family = isIP(address);
  if (family === 0 || rest.length > 0) return false;
  if (prefix === undefined) return true;
  return /^\d+$/.test(prefix) && Number(prefix) <= (family === 4 ? 32 : 128);
}

/**
 * Aturan keberadaan & kondisional. Dijalankan terpisah dari skema format supaya
 * semua masalah dilaporkan sekaligus (refinement zod dilewati bila ada error format).
 */
function checkRules(env: NodeJS.ProcessEnv): EnvIssue[] {
  const issues: EnvIssue[] = [];
  const value = (name: string) => (blankToUndefined(env[name]) as string | undefined)?.trim();

  for (const name of REQUIRED_ALWAYS) {
    if (!value(name)) issues.push({ name, message: "wajib di-set" });
  }
  const jwtSecret = value("JWT_SECRET");
  if (jwtSecret && jwtSecret.length < 32) {
    issues.push({ name: "JWT_SECRET", message: "panjang minimal 32 karakter" });
  }

  if (env.NODE_ENV === "production") {
    for (const name of REQUIRED_IN_PRODUCTION) {
      if (!value(name)) issues.push({ name, message: "wajib di-set saat NODE_ENV=production" });
    }
    if (!env.VERCEL && parseAllowedOrigins(env.ALLOWED_ORIGINS).length === 0) {
      issues.push({
        name: "ALLOWED_ORIGINS",
        message: "wajib di-set saat NODE_ENV=production di luar Vercel (origin aplikasi, mis. https://<hostname>)",
      });
    }
  }

  // TRUST_PROXY: `true` ditolak; selain angka/false, tiap entri harus preset atau IP/CIDR.
  const trustProxy = value("TRUST_PROXY");
  if (trustProxy) {
    const lowered = trustProxy.toLowerCase();
    if (lowered === "true") {
      issues.push({
        name: "TRUST_PROXY",
        message: "`true` ditolak karena membuat X-Forwarded-For bisa dipalsukan; gunakan jumlah hop atau daftar subnet",
      });
    } else if (lowered !== "false" && !/^\d+$/.test(trustProxy)) {
      const entries = trustProxy.split(",").map((entry) => entry.trim()).filter(Boolean);
      if (entries.length === 0 || !entries.every(isValidTrustProxyEntry)) {
        issues.push({
          name: "TRUST_PROXY",
          message: `harus jumlah hop, atau daftar ${TRUST_PROXY_PRESETS.join("/")}/IP/CIDR dipisah koma`,
        });
      }
    }
  }

  return issues;
}

/**
 * Validasi process.env. Jika gagal: tulis nama variabel + alasan, lalu exit(1).
 */
export function validateEnv(env: NodeJS.ProcessEnv = process.env): void {
  const issues = checkRules(env);

  const format = formatSchema.safeParse(env);
  if (!format.success) {
    for (const issue of format.error.issues) {
      issues.push({ name: issue.path.join("."), message: issue.message });
    }
  }

  if (issues.length === 0) return;

  console.error("[Env] Konfigurasi environment tidak valid:");
  for (const issue of issues) {
    console.error(`  - ${issue.name}: ${issue.message}`);
  }
  process.exit(1);
}
