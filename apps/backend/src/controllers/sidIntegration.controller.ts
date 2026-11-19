import type { Request, Response } from "express";
import { SidIntegrationService } from "../services/sidIntegration.service.js";

export class SidIntegrationController {
  static async getStatus(_req: Request, res: Response) {
    const status = SidIntegrationService.getStatus();
    return res.status(200).json({
      success: true,
      message: "Status integrasi SIDUTama berhasil diambil.",
      data: status,
    });
  }

  static async testPing(_req: Request, res: Response) {
    const result = await SidIntegrationService.ping();
    return res.status(result.ok ? 200 : (result.statusCode || 502)).json({
      success: result.ok,
      message: result.ok
        ? "Berhasil terhubung ke SIDUTama API."
        : `Gagal terhubung ke SIDUTama API: ${result.error}`,
      data: result.data ?? null,
      error: result.error ?? null,
      code: result.code ?? null,
    });
  }
}
