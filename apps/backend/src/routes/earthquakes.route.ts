import { Router, type Request, type Response } from "express";
import { EarthquakeService } from "../services/earthquake.service.js";
import type {
    ApiErrorResponse,
    ApiSuccessResponse,
} from "../types/weather.types.js";
import type { EarthquakeInfo } from "../types/earthquake.types.js";

export const publicEarthquakesRouter = Router();

const handleLatestEarthquake = async (_req: Request, res: Response) => {
    try {
        const data = await EarthquakeService.getLatest();

        const response: ApiSuccessResponse<EarthquakeInfo> = {
            success: true,
            message: "Latest earthquake retrieved successfully.",
            data,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("[GET /Earthquakes] error:", error);

        const response: ApiErrorResponse = {
            success: false,
            message: "Gagal mengambil data Earthquake BMKG",
            errors: [error instanceof Error ? error.message : String(error)],
        };

        res.status(502).json(response);
    }
};

/** GET /api/public/earthquakes/latest */
publicEarthquakesRouter.get("/latest", handleLatestEarthquake);

/** GET /api/public/earthquakes */
publicEarthquakesRouter.get("/", handleLatestEarthquake);
