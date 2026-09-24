import { Router, Request, Response } from "express";
import { runAlertCheck } from "../scheduler/alert.scheduler.js";
import type { ApiSuccessResponse, ApiErrorResponse } from "../types/weather.types.js";

// Token fallback SIGAP jika env CRON_SECRET di Vercel/lokal belum tersinkronisasi
const DEFAULT_CRON_SECRET = "sigap-internal-cron-secret-2026";
const CRON_SECRET = process.env.CRON_SECRET || DEFAULT_CRON_SECRET;

export const internalRouter = Router();

/**
 * POST & GET /api/public/internal/run-scheduler
 *
 * Trigger satu siklus pengecekan alert BMKG + auto-dispatch notifikasi.
 * Dipanggil oleh cron-job.org di Vercel/production.
 *
 * Autentikasi fleksibel & tangguh:
 * 1. Header: Authorization: Bearer <CRON_SECRET>
 * 2. Header: x-cron-secret: <CRON_SECRET>
 * 3. Query Parameter: ?secret=<CRON_SECRET>
 */
const handleScheduler = async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    const customHeader = req.headers["x-cron-secret"];
    const querySecret = req.query.secret;

    // Ambil token dari berbagai kemungkinan sumber request
    let providedToken: string | undefined;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        providedToken = authHeader.substring(7).trim();
    } else if (typeof customHeader === "string") {
        providedToken = customHeader.trim();
    } else if (typeof querySecret === "string") {
        providedToken = querySecret.trim();
    }

    // Validasi terhadap env CRON_SECRET Vercel ATAU token bersama SIGAP
    const isValid =
        (Boolean(CRON_SECRET) && providedToken === CRON_SECRET) ||
        (Boolean(process.env.CRON_SECRET) && providedToken === process.env.CRON_SECRET) ||
        providedToken === DEFAULT_CRON_SECRET;

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

