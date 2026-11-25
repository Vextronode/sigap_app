import { Router } from "express";
import { DeviceController } from "../controllers/device.controller.js";
import { deviceAuthMiddleware, optionalDeviceAuthMiddleware } from "../middleware/deviceAuth.middleware.js";
import { validateHeartbeat, validateRegisterDevice, validateStatusQuery } from "../validators/device.validator.js";

export const publicDeviceRouter = Router();

/**
 * GET /api/public/device/status: level alert terbaru. Unit Utama memanggilnya dengan
 * header x-device-token dan query deviceCode; tanpa header berlaku sebagai endpoint publik.
 */
publicDeviceRouter.get("/status", optionalDeviceAuthMiddleware, validateStatusQuery, DeviceController.getStatus);

/**
 * POST /api/public/device/register
 * SEC-07: Wajib menyertakan header x-device-token dari perangkat ESP32.
 */
publicDeviceRouter.post("/register", deviceAuthMiddleware, validateRegisterDevice, DeviceController.register);

/**
 * POST /api/public/device/heartbeat
 * SEC-07: Wajib menyertakan header x-device-token dari perangkat ESP32.
 */
publicDeviceRouter.post("/heartbeat", deviceAuthMiddleware, validateHeartbeat, DeviceController.heartbeat);
