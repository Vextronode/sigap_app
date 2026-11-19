import type { Request, Response } from "express";
import { SystemHealthService } from "../services/systemHealth.service.js";

export class SystemHealthController {
  static async getHealth(_req: Request, res: Response) {
    const data = await SystemHealthService.getHealth();

    return res.status(200).json({
      success: true,
      message: "Status konektivitas sistem berhasil diambil.",
      data,
    });
  }
}
