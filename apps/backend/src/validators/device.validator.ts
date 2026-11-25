import type { Request, Response, NextFunction } from "express";

const isFilled = (value: unknown): boolean => typeof value === "string" && value.trim() !== "";

// validasi body registrasi perangkat
export function validateRegisterDevice(req: Request, res: Response, next: NextFunction) {
  const { deviceCode, name } = req.body ?? {};
  const errors = [
    ...(!isFilled(deviceCode) ? ["deviceCode: wajib diisi."] : []),
    ...(!isFilled(name) ? ["name: wajib diisi."] : []),
  ];

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "deviceCode dan name wajib diisi.",
      errors,
    });
  }

  next();
}

// validasi body heartbeat perangkat
export function validateHeartbeat(req: Request, res: Response, next: NextFunction) {
  if (!isFilled(req.body?.deviceCode)) {
    return res.status(400).json({
      success: false,
      message: "deviceCode wajib diisi.",
      errors: ["deviceCode: wajib diisi."],
    });
  }

  next();
}
