import type { Request, Response } from "express";
import { HealthService } from "../services/health.service.js";
import type { ApiErrorResponse, ApiSuccessResponse } from "../types/weather.types.js";

type HealthData = { status: "ok" | "ready" };

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
    const response: ApiSuccessResponse<HealthData> = {
      success: true,
      message: "Service berjalan.",
      data: { status: "ok" },
    };
    res.status(200).json(response);
  }

  /**
   * Readiness: DB bisa menjawab dalam batas waktu. Detail kegagalan hanya ada di log.
   */
  static async readiness(_req: Request, res: Response) {
    if (await HealthService.isDatabaseReady()) {
      const response: ApiSuccessResponse<HealthData> = {
        success: true,
        message: "Service siap menerima trafik.",
        data: { status: "ready" },
      };
      res.status(200).json(response);
      return;
    }

    const response: ApiErrorResponse = {
      success: false,
      message: "Service belum siap.",
      errors: ["Database tidak tersedia."],
    };
    res.status(503).json(response);
  }
}
