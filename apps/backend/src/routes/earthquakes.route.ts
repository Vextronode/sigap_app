import { Router } from "express";
import { EarthquakeService } from "../services/earthquake.service.js";
import type {
    ApiErrorResponse,
    ApiSuccessResponse,
} from "../types/weather.types.js";
import type { EarthquakeInfo } from "../types/earthquake.types.js";

export const publicEarthquakesRouter = Router();

/** GET /api/public/earthquakes */
publicEarthquakesRouter.get("/", async (_req, res) => {
    try {
        const data = await EarthquakeService.getLatest();

        const response: ApiSuccessResponse<EarthquakeInfo> = {
            success: true,
            message: "Earthquake information retrieved successfully.",
            data,
        };

        res.json(response);
    } catch (error) {
        console.error("[GET /Earthquakes] error:", error);

        const response: ApiErrorResponse = {
            success: false,
            message: "Gagal mengambil data Earthquake BMKG",
            errors: [error instanceof Error ? error.message : String(error)],
        };

        res.status(502).json(response);
    }
});