import type { Request, Response } from "express";
import { DeviceService } from "../services/device.service.js";
import { AlertService } from "../services/alert.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export class DeviceController {
  // level alert yang berlaku dan ringkasan koneksi perangkat
  static getStatus = asyncHandler(async (_req: Request, res: Response) => {
    const systemStatus = await DeviceService.getSystemStatus();
    const currentAlert = await AlertService.getCurrentAlert();
    return res.status(200).json({
      success: true,
      message: "Status perangkat retrieved successfully.",
      data: {
        level: currentAlert?.level ?? "UNKNOWN",
        ...systemStatus,
      },
    });
  });

  // registrasi perangkat bila deviceCode belum ada
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { deviceCode, name } = req.body;
    const data = await DeviceService.register(deviceCode, name);
    return res.status(200).json({
      success: true,
      message: "Device registered successfully.",
      data,
    });
  });

  // heartbeat perangkat
  static heartbeat = asyncHandler(async (req: Request, res: Response) => {
    const data = await DeviceService.heartbeat(req.body.deviceCode);
    return res.status(200).json({
      success: true,
      message: "Heartbeat received successfully.",
      data,
    });
  });
}
