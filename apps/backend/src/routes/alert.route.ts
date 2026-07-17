import { Router } from "express";
import { AlertStatusService } from "../services/alertStatus.service.js";

import type {
    ApiErrorResponse,
    ApiSuccessResponse,
} from "../types/weather.types.js";

import type { CurrentAlert } from "../types/alert.types.js";

export const publicAlertsRouter = Router();

/**
 * GET /api/public/alerts
 * Mengambil status alert terkini berdasarkan Decision Engine.
 */
publicAlertsRouter.get("/", async (_req, res) => {
    try {
        const data = await AlertStatusService.getCurrentAlert();

        const response: ApiSuccessResponse<CurrentAlert> = {
            success: true,
            message: "Current alert retrieved successfully.",
            data,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("[GET /alerts]", error);

        const response: ApiErrorResponse = {
            success: false,
            message: "Gagal mengambil data peringatan dini dari BMKG",
            errors: [error instanceof Error ? error.message : String(error)],
        };

        res.status(502).json(response);
    }
});