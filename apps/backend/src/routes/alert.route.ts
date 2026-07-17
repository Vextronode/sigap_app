import { Router } from "express";
import { AlertController } from "../controllers/alert.controller.js";

export const publicAlertsRouter = Router();

/**
 * GET /api/public/alerts
 * Mengambil alert terkini yang sudah disimpan oleh scheduler.
 */
publicAlertsRouter.get("/", AlertController.getLatest);

/**
 * GET /api/public/alerts/current
 * Alias untuk kontrak dokumentasi lama.
 */
publicAlertsRouter.get("/current", AlertController.getLatest);

/**
 * GET /api/public/alerts/history
 * Mengambil riwayat alert.
 */
publicAlertsRouter.get("/history", AlertController.getHistory);
