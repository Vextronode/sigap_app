import type { Request, Response } from "express";
import { NotificationService } from "../services/notification.service.js";
import { VAPID_PUBLIC_KEY } from "../config/webPush.js";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
} from "../types/weather.types.js";
import type { PushSubscriptionInput } from "../types/notification.types.js";

export class NotificationController {
  /**
   * GET /api/v1/public/notifications/vapid-public-key
   * Diperlukan frontend browser untuk melakukan subscribe Web Push API.
   */
  static getVapidPublicKey(_req: Request, res: Response) {
    const response: ApiSuccessResponse<{ publicKey: string }> = {
      success: true,
      message: "VAPID public key retrieved successfully.",
      data: { publicKey: VAPID_PUBLIC_KEY },
    };
    return res.json(response);
  }

  /**
   * POST /api/v1/public/notifications/subscribe
   * Mendaftarkan token push browser ke database dengan validasi anti-SSRF (SEC-06).
   */
  static async subscribe(req: Request, res: Response) {
    const subscription = req.body as Partial<PushSubscriptionInput>;

    if (
      !subscription?.endpoint ||
      !subscription.keys?.p256dh ||
      !subscription.keys?.auth
    ) {
      const response: ApiErrorResponse = {
        success: false,
        message: "Payload subscription tidak valid.",
        errors: [
          ...(!subscription?.endpoint ? ["endpoint: wajib diisi."] : []),
          ...(!subscription?.keys?.p256dh ? ["keys.p256dh: wajib diisi."] : []),
          ...(!subscription?.keys?.auth ? ["keys.auth: wajib diisi."] : []),
        ],
      };
      return res.status(400).json(response);
    }

    // SEC-06: Validasi endpoint URL untuk mencegah Blind SSRF.
    // Hanya izinkan HTTPS ke domain push gateway terpercaya.
    try {
      const url = new URL(subscription.endpoint);

      if (url.protocol !== "https:") {
        throw new Error("Protokol wajib HTTPS.");
      }

      const TRUSTED_PUSH_HOSTS = [
        "fcm.googleapis.com",
        "updates.push.services.mozilla.com",
        "push.services.mozilla.com",
        "notify.windows.com",
      ];
      const isTrustedHost =
        TRUSTED_PUSH_HOSTS.some(
          (h) => url.hostname === h || url.hostname.endsWith(`.${h}`)
        ) || url.hostname.endsWith(".push.apple.com");

      if (!isTrustedHost) {
        throw new Error(`Host push endpoint tidak diizinkan: ${url.hostname}`);
      }
    } catch (err) {
      const response: ApiErrorResponse = {
        success: false,
        message: "Endpoint subscription tidak valid.",
        errors: [
          err instanceof Error
            ? err.message
            : "URL endpoint tidak dapat divalidasi.",
        ],
      };
      return res.status(400).json(response);
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
      return res.status(201).json(response);
    } catch (error) {
      console.error("[NotificationController.subscribe] error:", error);
      const response: ApiErrorResponse = {
        success: false,
        message: "Gagal menyimpan subscription.",
        errors: ["Terjadi kesalahan pada server."],
      };
      return res.status(500).json(response);
    }
  }

  /**
   * POST /api/v1/public/notifications/unsubscribe
   * Membatalkan langganan push endpoint tertentu.
   */
  static async unsubscribe(req: Request, res: Response) {
    const { endpoint } = req.body as { endpoint?: string };

    if (!endpoint) {
      const response: ApiErrorResponse = {
        success: false,
        message: "endpoint wajib diisi.",
        errors: ["endpoint: wajib diisi."],
      };
      return res.status(400).json(response);
    }

    await NotificationService.unsubscribe(endpoint);

    const response: ApiSuccessResponse<null> = {
      success: true,
      message: "Berhenti berlangganan notifikasi.",
      data: null,
    };
    return res.json(response);
  }

  /**
   * GET /api/v1/public/notifications/latest
   * Konten notifikasi terkini yang dibangun dari alert yang sama dengan dashboard.
   */
  static async getLatest(_req: Request, res: Response) {
    try {
      const data = await NotificationService.getLatestPayload();

      const response: ApiSuccessResponse<typeof data> = {
        success: true,
        message: data
          ? "Latest notification payload retrieved."
          : "Belum ada alert tersimpan.",
        data,
      };
      return res.json(response);
    } catch (error) {
      console.error("[NotificationController.getLatest] error:", error);
      const response: ApiErrorResponse = {
        success: false,
        message: "Gagal mengambil konten notifikasi.",
        errors: ["Layanan upstream sementara tidak tersedia."],
      };
      return res.status(502).json(response);
    }
  }

  /**
   * POST /api/v1/protected/notifications/dispatch
   * SEC-05: Dispatch manual notifikasi darurat massal hanya untuk Administrator.
   */
  static async dispatch(_req: Request, res: Response) {
    try {
      const payload = await NotificationService.getLatestPayload();

      if (!payload) {
        const response: ApiErrorResponse = {
          success: false,
          message: "Tidak ada alert untuk dikirim.",
          errors: ["Tidak ada alert untuk dikirim."],
        };
        return res.status(404).json(response);
      }

      if (!NotificationService.shouldNotify(payload.level)) {
        const response: ApiSuccessResponse<null> = {
          success: true,
          message: "Level saat ini AMAN — notifikasi tidak dikirim.",
          data: null,
        };
        return res.json(response);
      }

      const result = await NotificationService.dispatch(
        payload,
        "ADMIN_DISPATCH"
      );

      const response: ApiSuccessResponse<typeof result> = {
        success: true,
        message: `Notifikasi dikirim ke ${result.sent}/${result.total} subscriber.`,
        data: result,
      };
      return res.json(response);
    } catch (error) {
      console.error("[NotificationController.dispatch] error:", error);
      const response: ApiErrorResponse = {
        success: false,
        message: "Gagal mengirim notifikasi.",
        errors: ["Terjadi kesalahan pada server."],
      };
      return res.status(500).json(response);
    }
  }

  /**
   * GET /api/v1/protected/notifications/logs
   * SEC-08: Riwayat audit log notifikasi — hanya admin yang terautentikasi.
   */
  static async getLogs(req: Request, res: Response) {
    try {
      const limitParam = req.query.limit
        ? parseInt(String(req.query.limit), 10)
        : 20;
      const limit = isNaN(limitParam) ? 20 : Math.min(limitParam, 100);

      const logs = await NotificationService.getLogs(limit);

      const response: ApiSuccessResponse<typeof logs> = {
        success: true,
        message: `Berhasil mengambil ${logs.length} riwayat pengiriman notifikasi.`,
        data: logs,
      };
      return res.json(response);
    } catch (error) {
      console.error("[NotificationController.getLogs] error:", error);
      const response: ApiErrorResponse = {
        success: false,
        message: "Gagal mengambil riwayat log notifikasi.",
        errors: ["Terjadi kesalahan pada server."],
      };
      return res.status(500).json(response);
    }
  }

  /**
   * GET /api/v1/protected/notifications/subscribers/count
   * Mengambil total subscriber warga penerima Web Push aktif — admin & operator.
   */
  static async getSubscriberCount(_req: Request, res: Response) {
    try {
      const total = await NotificationService.getSubscriberCount();
      const response: ApiSuccessResponse<{ total: number }> = {
        success: true,
        message: "Berhasil mengambil statistik subscriber web push.",
        data: { total },
      };
      return res.json(response);
    } catch (error) {
      console.error(
        "[NotificationController.getSubscriberCount] error:",
        error
      );
      const response: ApiErrorResponse = {
        success: false,
        message: "Gagal mengambil data subscriber.",
        errors: ["Terjadi kesalahan pada server."],
      };
      return res.status(500).json(response);
    }
  }
}
