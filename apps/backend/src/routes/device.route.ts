import { Router } from "express";
import { DeviceService } from "../services/device.service.js";
import type {
    ApiErrorResponse,
    ApiSuccessResponse,
} from "../types/weather.types.js";

export const publicDeviceRouter = Router();

/**
 * GET /api/device/status
 * Mengambil status alert terbaru untuk ESP32
 */
publicDeviceRouter.get("/status", async (_req, res) => {
    try {
        const deviceStatus = await DeviceService.getAll();

        const response: ApiSuccessResponse<typeof deviceStatus> = {
            success: true,
            message: "Device status retrieved successfully.",
            data: deviceStatus,
        };

        res.json(response);
    } catch (error) {
        console.error("[GET /device/status] error:", error);

        const response: ApiErrorResponse = {
            success: false,
            message: "Gagal mengambil status perangkat.",
            errors: [error instanceof Error ? error.message : String(error)],
        };

        res.status(500).json(response);
    }
});

/**
 * POST /api/device/heartbeat
 * Dipanggil oleh ESP32 secara berkala
 */
publicDeviceRouter.post("/heartbeat", async (req, res) => {
    try {
        const { deviceCode } = req.body;

        if (!deviceCode) {
            const response: ApiErrorResponse = {
                success: false,
                message: "deviceCode wajib diisi.",
                errors: ["deviceCode is required"],
            };

            res.status(400).json(response);
            return;
        }

        const device = await DeviceService.heartbeat(deviceCode);

        const response: ApiSuccessResponse<typeof device> = {
            success: true,
            message: "Heartbeat received successfully.",
            data: device,
        };

        res.json(response);
    } catch (error) {
        console.error("[POST /device/heartbeat] error:", error);

        const response: ApiErrorResponse = {
            success: false,
            message: "Gagal memperbarui heartbeat perangkat.",
            errors: [error instanceof Error ? error.message : String(error)],
        };

        res.status(500).json(response);
    }
});