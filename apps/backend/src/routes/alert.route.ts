import { Router } from "express";
import { AlertController } from "../controllers/alert.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  validateAlertFilterQuery,
  validateReviewAlert,
} from "../validators/alert.validator.js";

// router publik alert untuk portal warga
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

/**
 * GET /api/public/alerts/:id
 * Mengambil detail satu alert.
 */
publicAlertsRouter.get("/:id", AlertController.getById);

// router terproteksi alert untuk admin & operator (FS-02)
export const protectedAlertsRouter = Router();

protectedAlertsRouter.use(authMiddleware);

/**
 * GET /api/protected/alerts
 * Mengambil daftar riwayat alert dengan filter (severity, reviewStatus, rentang tanggal) & pagination.
 */
protectedAlertsRouter.get(
  "/",
  validateAlertFilterQuery,
  AlertController.getFiltered
);

/**
 * GET /api/protected/alerts/:id
 * Mengambil detail satu alert lengkap dengan data reviewer.
 */
protectedAlertsRouter.get("/:id", AlertController.getById);

/**
 * PATCH /api/protected/alerts/:id/review
 * Melakukan klasifikasi review status alert oleh admin atau operator.
 */
protectedAlertsRouter.patch(
  "/:id/review",
  validateReviewAlert,
  AlertController.review
);

