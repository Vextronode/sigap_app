/**
 * Push Notification (Web Push) — SIGAP mengirim langsung ke warga, TIDAK
 * lewat SID. Alasan: notifikasi SID yang sudah ada itu untuk kasus berbeda
 * (info pengajuan surat diterima/ditolak admin desa), dan belum ada
 * kepastian tim SID mau/bisa menangani notifikasi kesiapsiagaan bencana.
 * Daripada bergantung ke tim lain yang belum pasti, SIGAP bangun sendiri.
 *
 * ✅ `dispatch()` dipanggil OTOMATIS dari `runAlertCheck()` di
 * `alert.scheduler.ts` — setiap kali ada alert baru non-duplikat dengan
 * level YELLOW/ORANGE/RED, notifikasi langsung dikirim ke semua subscriber
 * tanpa menunggu aksi manual admin, serta DICATAT RIWAYATNYA ke database `notification_logs`.
 */
import { prisma } from "../config/prisma.js";
import { webpush } from "../config/webPush.js";
import { AlertService } from "./alert.service.js";
import { EarthquakeService } from "./earthquake.service.js";
import { AlertLevel } from "../../generated/prisma/enums.js";
import type {
  DispatchResult,
  NotificationPayload,
  PushSubscriptionInput,
} from "../types/notification.types.js";

const LEVEL_LABEL: Record<string, string> = {
  GREEN: "Aman",
  YELLOW: "Waspada",
  ORANGE: "Siaga",
  RED: "Awas",
};

/**
 * Pola getar (vibrate) per level alert, satuan ms.
 * Format: [durasi_getar, durasi_jeda, durasi_getar, ...]
 * GREEN tidak perlu pola karena tidak pernah di-notif (dijaga shouldNotify()).
 */
const VIBRATION_PATTERNS: Record<string, number[]> = {
  GREEN:  [],
  YELLOW: [200],
  ORANGE: [200, 100, 200],
  RED:    [300, 100, 300, 100, 300],
};

export class NotificationService {
  static async subscribe(input: PushSubscriptionInput, userAgent?: string) {
    return prisma.pushSubscription.upsert({
      where: { endpoint: input.endpoint },
      update: { p256dh: input.keys.p256dh, auth: input.keys.auth, userAgent },
      create: {
        endpoint: input.endpoint,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
        userAgent,
      },
    });
  }

  static async unsubscribe(endpoint: string) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  }

  /**
   * Ambil riwayat audit pengiriman notifikasi dari database.
   */
  static async getLogs(limit = 20) {
    return prisma.notificationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        alert: {
          select: {
            id: true,
            level: true,
            source: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });
  }

  /**
   * GREEN (Aman) sengaja tidak dianggap notification-worthy — warga tidak
   * perlu di-notif untuk kondisi normal, cuma YELLOW/ORANGE/RED (Waspada/
   * Siaga/Awas). Ditaruh di sini (bukan langsung di route) supaya aturannya
   * satu tempat & gampang dites.
   */
  static shouldNotify(level: AlertLevel): boolean {
    return level !== AlertLevel.GREEN;
  }

  /**
   * Konten notifikasi siap kirim, dibangun dari alert TERBARU yang sudah
   * dihitung Decision Engine (tidak dihitung ulang di sini — satu sumber
   * kebenaran yang sama dengan dashboard, lihat catatan di decisionEngine.service.ts)
   * digabung data gempa Pangandaran terkait untuk isi body/gambar shakemap.
   */
  static async getLatestPayload(): Promise<NotificationPayload | null> {
    const alert = await AlertService.getCurrentAlert();
    if (!alert) return null;

    const earthquake = await EarthquakeService.getPangandaran();

    const levelText = LEVEL_LABEL[alert.level] ?? alert.level;

    const title = earthquake
      ? `[STATUS ${levelText.toUpperCase()}] Gempa Terdeteksi (${earthquake.magnitude} M)`
      : `[STATUS ${levelText.toUpperCase()}] Kesiapsiagaan Bencana`;

    const body = alert.description
      ? alert.description
      : earthquake
        ? `Magnitude ${earthquake.magnitude} M, kedalaman ${earthquake.depth}, ${earthquake.location}`
        : "Pantau kondisi terkini di dashboard SIGAP.";

    return {
      alertId: alert.id,
      level: alert.level,
      title,
      body,
      icon: "/assets/icons/icon-192.png",
      image: earthquake?.shakemap || undefined,
      url: "/",
      updatedAt: alert.updatedAt.toISOString(),
      vibrate: VIBRATION_PATTERNS[alert.level] ?? [],
      requireInteraction: alert.level !== AlertLevel.GREEN,
    };
  }

  /**
   * Kirim `payload` ke SEMUA subscription tersimpan & simpan audit trail ke `notification_logs`.
   */
  static async dispatch(
    payload: NotificationPayload,
    triggeredBy = "CRON_SCHEDULER"
  ): Promise<DispatchResult> {
    const subscriptions = await prisma.pushSubscription.findMany();

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        )
      )
    );

    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status !== "rejected") return;
      const statusCode = (result.reason as { statusCode?: number })?.statusCode;
      const endpointTrunc = subscriptions[index]?.endpoint.slice(0, 50) ?? "unknown";
      
      const errMsg = `Endpoint [${endpointTrunc}...]: Code ${statusCode ?? "N/A"} — ${
        result.reason instanceof Error ? result.reason.message : String(result.reason)
      }`;
      errors.push(errMsg);

      if (statusCode === 404 || statusCode === 410) return;
      console.error(`[NotificationService.dispatch] Gagal kirim: ${errMsg}`);
    });

    // Cleanup expired subscriptions (404/410)
    const expiredEndpoints = subscriptions
      .filter((_, index) => {
        const result = results[index];
        if (result.status !== "rejected") return false;
        const statusCode = (result.reason as { statusCode?: number })?.statusCode;
        return statusCode === 404 || statusCode === 410;
      })
      .map((sub) => sub.endpoint);

    if (expiredEndpoints.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: expiredEndpoints } },
      });
    }

    const sentCount = results.filter((r) => r.status === "fulfilled").length;
    const failedCount = results.filter((r) => r.status === "rejected").length;

    // Catat log pengiriman ke database PostgreSQL
    try {
      await prisma.notificationLog.create({
        data: {
          alertId: payload.alertId,
          level: payload.level as AlertLevel,
          title: payload.title,
          body: payload.body,
          triggeredBy,
          totalSubscribers: subscriptions.length,
          sentCount,
          failedCount,
          errorDetails: errors.length > 0 ? errors.join("\n") : null,
        },
      });
    } catch (logErr) {
      console.error("[NotificationService] Gagal menyimpan notification log:", logErr);
    }

    return {
      total: subscriptions.length,
      sent: sentCount,
      failed: failedCount,
    };
  }
}
