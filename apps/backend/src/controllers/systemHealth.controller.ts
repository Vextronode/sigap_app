import type { Request, Response } from "express";
import { SystemHealthService } from "../services/systemHealth.service.js";
import { SidIntegrationService } from "../services/sidIntegration.service.js";

export class SystemHealthController {
  static async getHealth(_req: Request, res: Response) {
    const data = await SystemHealthService.getHealth();

    return res.status(200).json({
      success: true,
      message: "Status konektivitas sistem berhasil diambil.",
      data,
    });
  }

  static async testSidPing(_req: Request, res: Response) {
    const result = await SidIntegrationService.ping();
    return res.status(result.ok ? 200 : (result.statusCode || 502)).json({
      success: result.ok,
      message: result.ok
        ? "Koneksi ke SIDUTama API berhasil."
        : `Gagal terhubung ke SIDUTama API: ${result.error}`,
      data: result.data ?? null,
      error: result.error ?? null,
      code: result.code ?? null,
    });
  }
}
