import { Router, type Request, type Response } from "express";
import { NotificationService } from "../services/notification.service.js";
import { VAPID_PUBLIC_KEY } from "../config/webPush.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
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
      errors: ["endpoint, keys.p256dh, dan keys.auth wajib diisi"],
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
      errors: [error instanceof Error ? error.message : String(error)],
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
      errors: ["endpoint is required"],
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
 * dibangun dari alert yang sama dengan dashboard (lihat notification.service.ts).
 * Endpoint ini juga yang tadinya direncanakan buat dikonsumsi tim SID —
 * tetap dipertahankan meski SIGAP sekarang kirim sendiri, siapa tahu SID
 * akhirnya jadi ikut relay juga nanti.
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
      errors: [error instanceof Error ? error.message : String(error)],
    };
    res.status(502).json(response);
  }
});

/**
 * POST /api/v1/protected/notifications/dispatch
 *
 * ⚠️ GERBANG SEMENTARA — lihat catatan lengkap di notification.service.ts.
 * Saat ini cuma butuh login (belum ada pengecekan role/permission spesifik,
 * karena RBAC belum ditegakkan di mana pun — lihat CHECKLIST_SIGAP_ALERTS.md
 * bagian 7). Begitu fitur admin & validasi alat/admin dikerjakan, endpoint
 * inilah yang dipanggil dari handler validasi itu, BUKAN dibuat ulang.
 */
protectedNotificationRouter.post("/dispatch", authMiddleware, async (_req: Request, res: Response) => {
  try {
    const payload = await NotificationService.getLatestPayload();

    if (!payload) {
      const response: ApiErrorResponse = {
        success: false,
        message: "Tidak ada alert untuk dikirim.",
        errors: [],
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

    const result = await NotificationService.dispatch(payload);

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
      errors: [error instanceof Error ? error.message : String(error)],
    };
    res.status(500).json(response);
  }
});
