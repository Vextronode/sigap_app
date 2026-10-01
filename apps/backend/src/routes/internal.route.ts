import { Router, Request, Response } from "express";
import { timingSafeEqual, createHash } from "crypto";
import { runAlertCheck } from "../scheduler/alert.scheduler.js";
import type { ApiSuccessResponse, ApiErrorResponse } from "../types/weather.types.js";

// SEC-01: Wajibkan CRON_SECRET dari environment variable, tolak fallback hardcoded
const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
    throw new Error("CRON_SECRET is not defined in environment variables.");
}

function safeTokenCompare(provided: string, expected: string): boolean {
    try {
        const a = createHash("sha256").update(provided).digest();
        const b = createHash("sha256").update(expected).digest();
        return timingSafeEqual(a, b);
    } catch {
        return false;
    }
}

export const internalRouter = Router();

/**
 * POST & GET /api/public/internal/run-scheduler
 *
 * Trigger satu siklus pengecekan alert BMKG + auto-dispatch notifikasi.
 * Dipanggil oleh cron-job.org di Vercel/production.
 *
 * Dilindungi oleh header:
 * 1. Authorization: Bearer <CRON_SECRET>
 * 2. x-cron-secret: <CRON_SECRET>
 * (Parameter query ?secret= ditiadakan untuk mencegah kebocoran secret di log URL)
 */
const handleScheduler = async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    const customHeader = req.headers["x-cron-secret"];

    // Ambil token hanya dari header yang aman
    let providedToken: string | undefined;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        providedToken = authHeader.substring(7).trim();
    } else if (typeof customHeader === "string") {
        providedToken = customHeader.trim();
    }

    // SEC-01: Validasi terhadap env CRON_SECRET menggunakan komparasi waktu konstan
    const isValid = Boolean(providedToken) && safeTokenCompare(providedToken!, CRON_SECRET);

    if (!isValid) {
        const response: ApiErrorResponse = {
            success: false,
            message: "Unauthorized",
            errors: ["Kredensial tidak valid atau tidak tersedia."],
        };
        res.status(401).json(response);
        return;
    }

    try {
        const result = await runAlertCheck();

        const response: ApiSuccessResponse<typeof result> = {
            success: true,
            message: result.saved
                ? `Alert check selesai — level ${result.level} disimpan.`
                : `Alert check selesai — level ${result.level} sudah sama, dilewati.`,
            data: result,
        };

        res.json(response);
    } catch (error) {
        console.error("[InternalRoute] run-scheduler error:", error);

        const response: ApiSuccessResponse<{ error: string }> = {
            success: true,
            message: "Pengecekan alert selesai dengan catatan degradasi layanan.",
            data: {
                error: error instanceof Error ? error.message : String(error),
            },
        };

        res.status(200).json(response);
    }
};

internalRouter.post("/run-scheduler", handleScheduler);
internalRouter.get("/run-scheduler", handleScheduler);

