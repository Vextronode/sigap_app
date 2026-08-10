import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL ?? "";

// Postgres lokal (dev) biasanya tidak mengaktifkan SSL sama sekali — memaksa
// SSL di sini bikin SEMUA query gagal ("The server does not support SSL
// connections"), termasuk endpoint /alerts yang murni baca DB. Endpoint lain
// (weather, earthquake) tidak kena karena mereka tidak menyentuh DB sama
// sekali. Deteksi localhost supaya dev tetap jalan tanpa SSL, tapi tetap
// wajib SSL begitu DATABASE_URL menunjuk ke host non-lokal (staging/produksi).
const isLocalDatabase = /localhost|127\.0\.0\.1/.test(databaseUrl);

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});