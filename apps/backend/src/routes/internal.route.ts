import { Router } from "express";
import { runAlertCheck } from "../scheduler/alert.scheduler.js";
import type { ApiSuccessResponse, ApiErrorResponse } from "../types/weather.types.js";

export const internalRouter = Router();

/**
 * POST /api/v1/public/internal/run-scheduler
 *
 * Trigger satu siklus pengecekan alert BMKG + auto-dispatch notifikasi.
 * Dipanggil oleh cron-job.org setiap 1 menit di Vercel/production.
 *
 * Dilindungi oleh header Authorization: Bearer <CRON_SECRET>.
 * Jika CRON_SECRET tidak di-set di env, endpoint terbuka (untuk testing awal).
 */
internalRouter.post("/run-scheduler", async (req, res) => {
    const secret = process.env.CRON_SECRET;

    if (secret) {
        const authHeader = req.headers.authorization;
        if (authHeader !== `Bearer ${secret}`) {
            const response: ApiErrorResponse = {
                success: false,
                message: "Unauthorized.",
                errors: ["Kredensial tidak valid atau tidak tersedia."],
            };
            res.status(401).json(response);
            return;
        }
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

        const response: ApiErrorResponse = {
            success: false,
            message: "Gagal menjalankan alert check.",
            errors: ["Terjadi kesalahan pada server."],
        };

        res.status(500).json(response);
    }
});
