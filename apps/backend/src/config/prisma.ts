import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { parseIntEnv, resolveDbSsl } from "./runtimeOptions.js";

const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || "";

// DEPLOY-01: SSL ditentukan lewat DB_SSL (disable | require | verify-full).
// Jika DB_SSL tidak di-set, dipakai heuristik lama: Postgres lokal (dev) biasanya
// tidak mengaktifkan SSL sama sekali, sehingga memaksa SSL bikin SEMUA query gagal
// ("The server does not support SSL connections"); host non-lokal tetap wajib SSL.
// Di Docker, host DB bukan localhost (mis. `db`), jadi set DB_SSL=disable di sana.
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: resolveDbSsl(process.env.DB_SSL, databaseUrl),
  max: parseIntEnv("DB_POOL_MAX", process.env.DB_POOL_MAX, 5, 1),
  // Tutup koneksi idle agar koneksi tidak menumpuk di server DB saat trafik sepi.
  // 0 = idle timeout dinonaktifkan (perilaku bawaan pg).
  idleTimeoutMillis: parseIntEnv("DB_POOL_IDLE_MS", process.env.DB_POOL_IDLE_MS, 10_000),
  connectionTimeoutMillis: 5_000,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});

/**
 * Tutup koneksi Prisma lalu pool pg. Dipakai saat graceful shutdown.
 */
export async function closeDatabase(): Promise<void> {
  await prisma.$disconnect();
  await pool.end();
}
