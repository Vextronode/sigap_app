import { pingDatabase } from "../repositories/health.repository.js";

const READINESS_DB_TIMEOUT_MS = 2_000;

export class HealthService {
  /**
   * DEPLOY-01 (FR-A4): true bila DB menjawab `SELECT 1` dalam batas waktu.
   * Penyebab kegagalan hanya ditulis ke log (satu baris), tidak dikembalikan ke pemanggil.
   */
  static async isDatabaseReady(): Promise<boolean> {
    let timer: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        pingDatabase(),
        new Promise((_, reject) => {
          timer = setTimeout(
            () => reject(new Error(`DB tidak merespons dalam ${READINESS_DB_TIMEOUT_MS} ms`)),
            READINESS_DB_TIMEOUT_MS
          );
        }),
      ]);
      return true;
    } catch (error) {
      // Pesan Prisma bersifat multi-baris; baris terakhir memuat penyebabnya.
      const message = error instanceof Error ? error.message : String(error);
      const cause = message.split("\n").map((line) => line.trim()).filter(Boolean).pop();
      console.error("[Readiness] DB check gagal:", cause ?? "unknown error");
      return false;
    } finally {
      clearTimeout(timer);
    }
  }
}
