import { Router } from "express";
import { runAlertCheck } from "../scheduler/alert.scheduler.js";
import type { ApiSuccessResponse, ApiErrorResponse } from "../types/weather.types.js";

const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
    throw new Error("CRON_SECRET is not defined in environment variables.");
}

export const internalRouter = Router();

/**
 * POST /api/public/internal/run-scheduler
 *
 * Trigger satu siklus pengecekan alert BMKG + auto-dispatch notifikasi.
 * Dipanggil oleh cron-job.org setiap 1 menit di Vercel/production.
 *
 * Dilindungi oleh header Authorization: Bearer <CRON_SECRET>. Wajib di-set —
 * server tidak akan start tanpa env var ini.
 */
internalRouter.post("/run-scheduler", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (authHeader !== `Bearer ${CRON_SECRET}`) {
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
});
