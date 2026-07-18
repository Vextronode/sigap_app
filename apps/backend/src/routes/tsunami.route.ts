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

const getTsunamiDescription = (status: TsunamiStatusLevel) => {
    switch (status) {
        case "AWAS":
            return "BMKG mengeluarkan status AWAS tsunami. Ikuti arahan evakuasi resmi.";
        case "SIAGA":
            return "BMKG mengeluarkan status SIAGA tsunami. Siapkan diri untuk evakuasi.";
        case "WASPADA":
            return "BMKG mengeluarkan status WASPADA tsunami. Tetap pantau informasi resmi.";
        case "NORMAL":
        default:
            return "Tidak ada peringatan tsunami aktif dari BMKG.";
    }
};

const buildTsunamiStatus = async (): Promise<TsunamiStatusResponse> => {
    const status = await BmkgService.getTsunamiStatus();

    return {
        status,
        description: getTsunamiDescription(status),
        source: "BMKG InaTEWS",
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
            errors: [error instanceof Error ? error.message : String(error)],
        };

        res.status(502).json(response);
    }
};

export const publicTsunamiRouter = Router();

publicTsunamiRouter.get("/status", handleTsunamiStatus);
publicTsunamiRouter.get("/", handleTsunamiStatus);
