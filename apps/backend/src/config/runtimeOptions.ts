/**
 * DEPLOY-01: Parser opsi runtime yang dibaca dari environment variable.
 *
 * Modul ini murni (tanpa efek samping saat di-import) supaya bisa dipakai bersama
 * oleh modul runtime (prisma, app, scheduler) dan oleh validasi startup (env.ts).
 * Pesan error hanya menyebut NAMA variabel dan nilai yang didukung, tidak pernah
 * nilai yang sedang di-set.
 */

export const DB_SSL_MODES = ["disable", "require", "verify-full"] as const;
export type DbSslMode = (typeof DB_SSL_MODES)[number];

export type DbSslConfig = false | { rejectUnauthorized: boolean };

function isUnset(raw: string | undefined): raw is undefined | "" {
  return raw === undefined || raw.trim() === "";
}

/**
 * Bilangan bulat >= `min` dari env. Nilai kosong/tidak di-set memakai default.
 */
export function parseIntEnv(name: string, raw: string | undefined, defaultValue: number, min = 0): number {
  if (isUnset(raw)) return defaultValue;
  const value = raw.trim();
  if (!/^\d+$/.test(value) || Number(value) < min) {
    throw new Error(`${name} harus berupa bilangan bulat >= ${min}.`);
  }
  return Number(value);
}

export function isDbSslMode(raw: string): raw is DbSslMode {
  return (DB_SSL_MODES as readonly string[]).includes(raw);
}

/**
 * Mode SSL koneksi DB.
 * - disable     → tanpa SSL (mis. container Postgres di jaringan internal Docker)
 * - require     → SSL tanpa verifikasi sertifikat (perilaku lama untuk host non-lokal)
 * - verify-full → SSL dengan verifikasi sertifikat
 * - tidak di-set → heuristik lama: host lokal tanpa SSL, selain itu `require`
 */
export function resolveDbSsl(raw: string | undefined, databaseUrl: string): DbSslConfig {
  if (isUnset(raw)) {
    const isLocalDatabase = /localhost|127\.0\.0\.1/.test(databaseUrl);
    return isLocalDatabase ? false : { rejectUnauthorized: false };
  }

  const mode = raw.trim();
  if (!isDbSslMode(mode)) {
    throw new Error(`DB_SSL tidak valid. Nilai yang didukung: ${DB_SSL_MODES.join(", ")}.`);
  }

  switch (mode) {
    case "disable":
      return false;
    case "require":
      return { rejectUnauthorized: false };
    case "verify-full":
      return { rejectUnauthorized: true };
  }
}
