import { Router, type Request, type Response } from "express";
import { BmkgService } from "../services/bmkg.service.js";
import type {
    ApiErrorResponse,
    ApiSuccessResponse,
} from "../types/weather.types.js";
import type { TsunamiStatus as TsunamiStatusLevel } from "../types/alert.types.js";

type TsunamiStatusResponse = {
    status: TsunamiStatusLevel;
    description: string;
    source: string;
    updatedAt: string;
};

/**
 * `source`/`description` datang langsung dari BmkgService.getTsunamiStatus() —
 * bisa "BMKG InaTEWS" (override manual resmi) atau "BMKG (estimasi dari data
 * gempa)" (otomatis, dibatasi maksimal WASPADA). Route ini sengaja TIDAK
 * membangun ulang description-nya sendiri, supaya tidak ada dua sumber teks
 * yang bisa saling tidak sinkron.
 */
const buildTsunamiStatus = async (): Promise<TsunamiStatusResponse> => {
    const { status, source, description } = await BmkgService.getTsunamiStatus();

    return {
        status,
        description,
        source,
        updatedAt: new Date().toISOString(),
    };
};

const handleTsunamiStatus = async (_req: Request, res: Response) => {
    try {
        const data = await buildTsunamiStatus();

        const response: ApiSuccessResponse<TsunamiStatusResponse> = {
            success: true,
            message: "Tsunami status retrieved successfully.",
            data,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("[GET /tsunami/status] error:", error);

        const response: ApiErrorResponse = {
            success: false,
            message: "Gagal mengambil status tsunami.",
            errors: ["Layanan upstream sementara tidak tersedia."],
        };

        res.status(502).json(response);
    }
};

export const publicTsunamiRouter = Router();

publicTsunamiRouter.get("/status", handleTsunamiStatus);
publicTsunamiRouter.get("/", handleTsunamiStatus);
