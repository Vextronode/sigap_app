import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

const READINESS_DB_TIMEOUT_MS = 2_000;

/**
 * DEPLOY-01 (FR-A4): Healthcheck ringan untuk orchestrator container.
 * Berbeda dengan /system-health (panggilan API eksternal, rate limit, cache),
 * endpoint ini murah dan tidak membuka versi, hostname, maupun nama penyedia.
 */
export class HealthController {
  /**
   * Liveness: proses hidup dan event loop merespons. Tanpa DB/panggilan eksternal.
   */
  static liveness(_req: Request, res: Response) {
    res.status(200).json({ status: "ok" });
  }

  /**
   * Readiness: DB bisa menjawab `SELECT 1` dalam batas waktu.
   * Detail error hanya ke log, tidak ke response.
   */
  static async readiness(_req: Request, res: Response) {
    let timer: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => {
          timer = setTimeout(
            () => reject(new Error(`DB tidak merespons dalam ${READINESS_DB_TIMEOUT_MS} ms`)),
            READINESS_DB_TIMEOUT_MS
          );
        }),
      ]);
      res.status(200).json({ status: "ready" });
    } catch (error) {
      // Pesan Prisma bersifat multi-baris; baris terakhir memuat penyebabnya.
      const message = error instanceof Error ? error.message : String(error);
      const cause = message.split("\n").map((line) => line.trim()).filter(Boolean).pop();
      console.error("[Readiness] DB check gagal:", cause ?? "unknown error");
      res.status(503).json({ status: "not_ready" });
    } finally {
      clearTimeout(timer);
    }
  }
}
