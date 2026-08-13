import { Router } from "express";
import { DeviceService } from "../services/device.service.js";
import { AlertService } from "../services/alert.service.js";
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
        const currentAlert = await AlertService.getCurrentAlert();
        const level = currentAlert?.level || "GREEN";

        const response: ApiSuccessResponse<{ level: string }> = {
            success: true,
            message: "Status alert retrieved successfully.",
            data: {
                level,
            },
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
 * POST /api/device/register
 * Mendaftarkan perangkat baru atau mengambil perangkat jika sudah terdaftar
 */
publicDeviceRouter.post("/register", async (req, res) => {
    try {
        const { deviceCode, name } = req.body;

        if (!deviceCode || !name) {
            const response: ApiErrorResponse = {
                success: false,
                message: "deviceCode dan name wajib diisi.",
                errors: ["deviceCode and name are required"],
            };

            res.status(400).json(response);
            return;
        }

        const device = await DeviceService.register(deviceCode, name);

        const response: ApiSuccessResponse<typeof device> = {
            success: true,
            message: "Device registered successfully.",
            data: device,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("[POST /device/register] error:", error);

        const response: ApiErrorResponse = {
            success: false,
            message: "Gagal meregistrasi perangkat.",
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