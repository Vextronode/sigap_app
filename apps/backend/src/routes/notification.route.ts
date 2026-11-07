import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

export const publicNotificationRouter = Router();
export const protectedNotificationRouter = Router();

/**
 * GET /api/public/notifications/vapid-public-key
 * Dibutuhkan frontend browser untuk subscribe Web Push API.
 */
publicNotificationRouter.get(
  "/vapid-public-key",
  NotificationController.getVapidPublicKey
);

/**
 * POST /api/public/notifications/subscribe
 * Mendaftarkan subscription token push warga.
 */
publicNotificationRouter.post(
  "/subscribe",
  NotificationController.subscribe
);

/**
 * POST /api/public/notifications/unsubscribe
 * Membatalkan subscription token push.
 */
publicNotificationRouter.post(
  "/unsubscribe",
  NotificationController.unsubscribe
);

/**
 * GET /api/public/notifications/latest
 * Konten payload notifikasi darurat terkini.
 */
publicNotificationRouter.get(
  "/latest",
  NotificationController.getLatest
);

/**
 * POST /api/protected/notifications/dispatch
 * SEC-05: Dispatch manual notifikasi darurat massal hanya untuk Administrator.
 */
protectedNotificationRouter.post(
  "/dispatch",
  authMiddleware,
  requireRole("admin"),
  NotificationController.dispatch
);

/**
 * GET /api/protected/notifications/logs
 * SEC-08: Riwayat audit log pengiriman notifikasi — hanya admin terautentikasi.
 */
protectedNotificationRouter.get(
  "/logs",
  authMiddleware,
  NotificationController.getLogs
);

/**
 * GET /api/protected/notifications/subscribers/count
 * Mengambil total statistik subscriber warga penerima Web Push aktif.
 */
protectedNotificationRouter.get(
  "/subscribers/count",
  authMiddleware,
  NotificationController.getSubscriberCount
);
