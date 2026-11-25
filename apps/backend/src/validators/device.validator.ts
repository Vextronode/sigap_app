import type { Request, Response, NextFunction } from "express";

const DEVICE_CODE_MAX_LENGTH = 64;
const DEVICE_NAME_MAX_LENGTH = 150;

const isFilled = (value: unknown): value is string => typeof value === "string" && value.trim() !== "";

const deviceCodeError = (deviceCode: unknown): string | null => {
  if (!isFilled(deviceCode)) return "deviceCode: wajib diisi.";
  if (deviceCode.length > DEVICE_CODE_MAX_LENGTH) {
    return `deviceCode: maksimal ${DEVICE_CODE_MAX_LENGTH} karakter.`;
  }
  return null;
};

const rejectInvalid = (res: Response, message: string, errors: string[]) =>
  res.status(400).json({ success: false, message, errors });

// validasi body registrasi perangkat
export function validateRegisterDevice(req: Request, res: Response, next: NextFunction) {
  const { deviceCode, name } = req.body ?? {};
  const nameError = !isFilled(name)
    ? "name: wajib diisi."
    : name.length > DEVICE_NAME_MAX_LENGTH
      ? `name: maksimal ${DEVICE_NAME_MAX_LENGTH} karakter.`
      : null;
  const errors = [deviceCodeError(deviceCode), nameError].filter((error): error is string => error !== null);

  if (errors.length > 0) return rejectInvalid(res, "deviceCode dan name wajib diisi dengan benar.", errors);
  next();
}

// validasi body heartbeat perangkat; field lain (mis. firmwareVersion) diterima dan belum disimpan
export function validateHeartbeat(req: Request, res: Response, next: NextFunction) {
  const error = deviceCodeError(req.body?.deviceCode);
  if (error) return rejectInvalid(res, "deviceCode wajib diisi dengan benar.", [error]);
  next();
}

// validasi query deviceCode opsional pada poll status
export function validateStatusQuery(req: Request, res: Response, next: NextFunction) {
  const { deviceCode } = req.query;
  const error = deviceCode === undefined ? null : deviceCodeError(deviceCode);
  if (error) return rejectInvalid(res, "deviceCode tidak valid.", [error]);
  next();
}
