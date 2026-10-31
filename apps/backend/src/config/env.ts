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

const BLANK_NOT_ALLOWED = "tidak boleh kosong (hapus variabelnya untuk memakai default, atau isi nilainya)";

/**
 * `blankAsDefault`:
 * - true  → kosong = tidak di-set (parser DEPLOY-01 di runtimeOptions memakai default).
 * - false → kosong ditolak. Modul lama membaca env dengan `Number(x ?? default)`,
 *           sehingga string kosong menjadi 0/NaN alih-alih default.
 */
const optionalInt = (min = 0, blankAsDefault = false) => {
  const schema = z
    .string()
    .trim()
    .min(1, BLANK_NOT_ALLOWED)
    .regex(/^\d+$/, "harus berupa bilangan bulat")
    .refine((value) => Number(value) >= min, `harus >= ${min}`)
    .optional();
  return blankAsDefault ? z.preprocess(blankToUndefined, schema) : schema;
};

const optionalNumber = z
  .string()
  .trim()
  .min(1, BLANK_NOT_ALLOWED)
  .refine((value) => Number.isFinite(Number(value)), "harus berupa angka")
  .optional();

const optionalNonBlank = z.string().trim().min(1, BLANK_NOT_ALLOWED).optional();

/**
 * Format variabel opsional (hanya dicek bila di-set).
 */
const formatSchema = z.object({
  // Variabel baru DEPLOY-01: kosong = default.
  DB_SSL: z.preprocess(
    blankToUndefined,
    z.enum(DB_SSL_MODES, `harus salah satu dari: ${DB_SSL_MODES.join(", ")}`).optional()
  ),
  DB_POOL_MAX: optionalInt(1, true),
  DB_POOL_IDLE_MS: optionalInt(0, true),
  ALERT_SCHEDULER_INTERVAL_MS: optionalInt(15_000, true),
  SHUTDOWN_TIMEOUT_MS: optionalInt(0, true),

  // Dibaca modul lama dengan `?? default`: kosong ditolak.
  PORT: optionalInt(),
  VILLAGE_LAT: optionalNumber,
  VILLAGE_LON: optionalNumber,
  EARTHQUAKE_CACHE_TTL_MS: optionalInt(),
  HTTP_TIMEOUT_MS: optionalInt(),
  HTTP_RETRY_DELAY_MS: optionalInt(),
  HTTP_RETRY_COUNT: optionalInt(),
  PANGANDARAN_RADIUS_KM: optionalInt(),
  WEST_JAVA_RADIUS_KM: optionalInt(),
  PANGANDARAN_MAX_AGE_DAYS: optionalInt(),
  WEST_JAVA_MAX_AGE_DAYS: optionalInt(),
  BMKG_ADM4_CODE: optionalNonBlank,
  JWT_EXPIRES_IN: optionalNonBlank,
  JWT_ISSUER: optionalNonBlank,
  JWT_AUDIENCE: optionalNonBlank,
  VAPID_SUBJECT: optionalNonBlank,
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
    // Satu pesan per variabel (pesan pertama paling relevan).
    const reported = new Set(issues.map((issue) => issue.name));
    for (const issue of format.error.issues) {
      const name = issue.path.join(".");
      if (reported.has(name)) continue;
      reported.add(name);
      issues.push({ name, message: issue.message });
    }
  }

  if (issues.length === 0) return;

  console.error("[Env] Konfigurasi environment tidak valid:");
  for (const issue of issues) {
    console.error(`  - ${issue.name}: ${issue.message}`);
  }
  process.exit(1);
}
