import { Router, type Request, type Response } from "express";
import { NotificationService } from "../services/notification.service.js";
import { VAPID_PUBLIC_KEY } from "../config/webPush.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";
import type { ApiErrorResponse, ApiSuccessResponse } from "../types/weather.types.js";
import type { PushSubscriptionInput } from "../types/notification.types.js";

export const publicNotificationRouter = Router();
export const protectedNotificationRouter = Router();

/** GET /api/v1/public/notifications/vapid-public-key — dibutuhkan frontend buat subscribe() */
publicNotificationRouter.get("/vapid-public-key", (_req, res) => {
  const response: ApiSuccessResponse<{ publicKey: string }> = {
    success: true,
    message: "VAPID public key retrieved successfully.",
    data: { publicKey: VAPID_PUBLIC_KEY },
  };
  res.json(response);
});

/** POST /api/v1/public/notifications/subscribe */
publicNotificationRouter.post("/subscribe", async (req: Request, res: Response) => {
  const subscription = req.body as Partial<PushSubscriptionInput>;

  if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    const response: ApiErrorResponse = {
      success: false,
      message: "Payload subscription tidak valid.",
      errors: [
        ...(!subscription?.endpoint ? ["endpoint: wajib diisi."] : []),
        ...(!subscription?.keys?.p256dh ? ["keys.p256dh: wajib diisi."] : []),
        ...(!subscription?.keys?.auth ? ["keys.auth: wajib diisi."] : []),
      ],
    };
    res.status(400).json(response);
    return;
  }

  // SEC-06: Validasi endpoint URL untuk mencegah Blind SSRF.
  // Hanya izinkan HTTPS ke domain push gateway terpercaya.
  try {
    const url = new URL(subscription.endpoint);

    // Wajib HTTPS
    if (url.protocol !== "https:") {
      throw new Error("Protokol wajib HTTPS.");
    }

    // Whitelist push gateway terpercaya
    const TRUSTED_PUSH_HOSTS = [
      "fcm.googleapis.com",
      "updates.push.services.mozilla.com",
      "push.services.mozilla.com",
      "notify.windows.com",
    ];
    const isTrustedHost =
      TRUSTED_PUSH_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`)) ||
      // Apple Push: *.push.apple.com
      url.hostname.endsWith(".push.apple.com");

    if (!isTrustedHost) {
      throw new Error(`Host push endpoint tidak diizinkan: ${url.hostname}`);
    }
  } catch (err) {
    const response: ApiErrorResponse = {
      success: false,
      message: "Endpoint subscription tidak valid.",
      errors: [err instanceof Error ? err.message : "URL endpoint tidak dapat divalidasi."],
    };
    res.status(400).json(response);
    return;
  }

  try {
    await NotificationService.subscribe(
      subscription as PushSubscriptionInput,
      req.headers["user-agent"]
    );

    const response: ApiSuccessResponse<null> = {
      success: true,
      message: "Berhasil berlangganan notifikasi.",
      data: null,
    };
    res.status(201).json(response);
  } catch (error) {
    console.error("[POST /notifications/subscribe] error:", error);
    const response: ApiErrorResponse = {
      success: false,
      message: "Gagal menyimpan subscription.",
      errors: ["Terjadi kesalahan pada server."],
    };
    res.status(500).json(response);
  }
});

/** POST /api/v1/public/notifications/unsubscribe */
publicNotificationRouter.post("/unsubscribe", async (req: Request, res: Response) => {
  const { endpoint } = req.body as { endpoint?: string };

  if (!endpoint) {
    const response: ApiErrorResponse = {
      success: false,
      message: "endpoint wajib diisi.",
      errors: ["endpoint: wajib diisi."],
    };
    res.status(400).json(response);
    return;
  }

  await NotificationService.unsubscribe(endpoint);

  const response: ApiSuccessResponse<null> = {
    success: true,
    message: "Berhenti berlangganan notifikasi.",
    data: null,
  };
  res.json(response);
});

/**
 * GET /api/v1/public/notifications/latest — konten notifikasi terkini,
 * dibangun dari alert yang sama dengan dashboard.
 */
publicNotificationRouter.get("/latest", async (_req: Request, res: Response) => {
  try {
    const data = await NotificationService.getLatestPayload();

    const response: ApiSuccessResponse<typeof data> = {
      success: true,
      message: data ? "Latest notification payload retrieved." : "Belum ada alert tersimpan.",
      data,
    };
    res.json(response);
  } catch (error) {
    console.error("[GET /notifications/latest] error:", error);
    const response: ApiErrorResponse = {
      success: false,
      message: "Gagal mengambil konten notifikasi.",
      errors: ["Layanan upstream sementara tidak tersedia."],
    };
    res.status(502).json(response);
  }
});

/**
 * GET /api/v1/public/notifications/logs
 * SEC-08: Endpoint logs dipindah ke protectedNotificationRouter — hanya admin.
 * Alias publik dihapus agar statistik subscriber tidak terekspos ke siapapun.
 * @deprecated Gunakan GET /api/protected/notifications/logs
 */
// publicNotificationRouter.get("/logs", ...) ← DIHAPUS (SEC-08)


/**
 * POST /api/v1/protected/notifications/dispatch
 * SEC-05: Dispatch manual notifikasi darurat massal hanya untuk Administrator.
 */
protectedNotificationRouter.post("/dispatch", authMiddleware, requireRole("admin"), async (_req: Request, res: Response) => {
  try {
    const payload = await NotificationService.getLatestPayload();

    if (!payload) {
      const response: ApiErrorResponse = {
        success: false,
        message: "Tidak ada alert untuk dikirim.",
        errors: ["Tidak ada alert untuk dikirim."],
      };
      res.status(404).json(response);
      return;
    }

    if (!NotificationService.shouldNotify(payload.level)) {
      const response: ApiSuccessResponse<null> = {
        success: true,
        message: "Level saat ini AMAN — notifikasi tidak dikirim.",
        data: null,
      };
      res.json(response);
      return;
    }

    const result = await NotificationService.dispatch(payload, "ADMIN_DISPATCH");

    const response: ApiSuccessResponse<typeof result> = {
      success: true,
      message: `Notifikasi dikirim ke ${result.sent}/${result.total} subscriber.`,
      data: result,
    };
    res.json(response);
  } catch (error) {
    console.error("[POST /notifications/dispatch] error:", error);
    const response: ApiErrorResponse = {
      success: false,
      message: "Gagal mengirim notifikasi.",
      errors: ["Terjadi kesalahan pada server."],
    };
    res.status(500).json(response);
  }
});

/**
 * GET /api/v1/protected/notifications/logs
 * SEC-08: Riwayat audit log notifikasi — hanya admin yang terautentikasi.
 */
protectedNotificationRouter.get("/logs", authMiddleware, async (req: Request, res: Response) => {
  try {
    const limitParam = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const limit = isNaN(limitParam) ? 20 : Math.min(limitParam, 100);

    const logs = await NotificationService.getLogs(limit);

    const response: ApiSuccessResponse<typeof logs> = {
      success: true,
      message: `Berhasil mengambil ${logs.length} riwayat pengiriman notifikasi.`,
      data: logs,
    };
    res.json(response);
  } catch (error) {
    console.error("[GET /protected/notifications/logs] error:", error);
    const response: ApiErrorResponse = {
      success: false,
      message: "Gagal mengambil riwayat log notifikasi.",
      errors: ["Terjadi kesalahan pada server."],
    };
    res.status(500).json(response);
  }
});
