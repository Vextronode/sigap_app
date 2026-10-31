import "dotenv/config";
import { setDefaultResultOrder } from "node:dns";
import { startAlertScheduler } from "./scheduler/alert.scheduler.js";
import { closeDatabase } from "./config/prisma.js";
import { parseIntEnv } from "./config/runtimeOptions.js";

setDefaultResultOrder("ipv4first");

import app from "./app.js";

const PORT = process.env.PORT ?? 3000;
const SHUTDOWN_TIMEOUT_MS = parseIntEnv("SHUTDOWN_TIMEOUT_MS", process.env.SHUTDOWN_TIMEOUT_MS, 10_000);

const server = app.listen(PORT, () => {
  console.log(`SIGAP backend running on port ${PORT}`);
});

let stopScheduler: () => Promise<void> = async () => {};

if (process.env.ENABLE_LOCAL_SCHEDULER === "true") {
  stopScheduler = startAlertScheduler();
} else {
  console.log(
    "[AlertScheduler] Local background scheduler dinonaktifkan secara default untuk menghemat kuota compute Neon Cloud. Set ENABLE_LOCAL_SCHEDULER=true di .env jika ingin mengaktifkan pengujian berkala lokal."
  );
}

/**
 * DEPLOY-01 (FR-A5): Graceful shutdown untuk container yang berumur panjang.
 * Urutan: hentikan scheduler → berhenti menerima koneksi baru dan tunggu request
 * yang berjalan → tutup DB → exit. Dibatasi SHUTDOWN_TIMEOUT_MS; hanya jalan sekali.
 */
let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[Shutdown] signal diterima (${signal})`);

  const forceExit = setTimeout(() => {
    console.error(`[Shutdown] Melewati batas ${SHUTDOWN_TIMEOUT_MS} ms, keluar paksa.`);
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  try {
    await stopScheduler();

    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    console.log("[Shutdown] HTTP server ditutup.");

    await closeDatabase();
    console.log("[Shutdown] Koneksi DB ditutup.");
  } catch (error) {
    console.error("[Shutdown] Gagal saat shutdown:", error instanceof Error ? error.message : error);
    process.exit(1);
  }

  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
