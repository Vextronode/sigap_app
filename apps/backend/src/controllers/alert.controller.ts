import type { Request, Response } from "express";

import { AlertService } from "../services/alert.service.js";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
} from "../types/weather.types.js";
import type { AlertRecord } from "../types/alert.types.js";

export class AlertController {
  static async getLatest(_req: Request, res: Response) {
    try {
      const data = await AlertService.getCurrentAlert();

      const response: ApiSuccessResponse<AlertRecord | null> = {
        success: true,
        message: data
          ? "Latest alert retrieved successfully."
          : "No alert available yet.",
        data,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("[GET /alerts] error:", error);

      const response: ApiErrorResponse = {
        success: false,
        message: "Gagal mengambil alert terbaru.",
        errors: [error instanceof Error ? error.message : String(error)],
      };

      res.status(502).json(response);
    }
  }

  static async getHistory(_req: Request, res: Response) {
    try {
      const data = await AlertService.getAllAlerts();

      const response: ApiSuccessResponse<AlertRecord[]> = {
        success: true,
        message: "Alert history retrieved successfully.",
        data,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("[GET /alerts/history] error:", error);

      const response: ApiErrorResponse = {
        success: false,
        message: "Gagal mengambil riwayat alert.",
        errors: [error instanceof Error ? error.message : String(error)],
      };

      res.status(502).json(response);
    }
  }
}
