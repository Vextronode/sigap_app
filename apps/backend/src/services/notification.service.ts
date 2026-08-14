/**
 * Push Notification (Web Push) — SIGAP mengirim langsung ke warga, TIDAK
 * lewat SID. Alasan: notifikasi SID yang sudah ada itu untuk kasus berbeda
 * (info pengajuan surat diterima/ditolak admin desa), dan belum ada
 * kepastian tim SID mau/bisa menangani notifikasi kesiapsiagaan bencana.
 * Daripada bergantung ke tim lain yang belum pasti, SIGAP bangun sendiri.
 *
 * ⚠️ RUANG KOSONG SENGAJA DIBIARKAN — BACA SEBELUM MENGUBAH:
 * `dispatch()` di bawah ini TIDAK dipanggil otomatis dari mana pun (bukan
 * dari alert.scheduler.ts, bukan dari mana pun). Ini sengaja. Alat sirine
 * fisik nanti juga berperan (tombol fisik di kantor desa), dan validasi
 * akhir sebelum notifikasi benar-benar terkirim ke warga akan berupa aksi
 * manusia — admin klik tombol di dashboard, ATAU operator menekan tombol di
 * alat sirine. Kedua jalur itu BELUM ada (fitur admin & protokol device→alert
 * masih di sprint berikutnya, lihat CHECKLIST_SIGAP_ALERTS.md).
 *
 * Untuk sekarang, `dispatch()` hanya bisa dipicu manual lewat
 * `POST /api/v1/protected/notifications/dispatch` (butuh login — lihat
 * notification.route.ts) sebagai gerbang sementara. TODO saat admin/device
 * validation dikerjakan: panggil `NotificationService.dispatch()` dari
 * handler validasi itu (bukan bikin ulang logic pengiriman push).
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
    };
  }

  /**
   * Kirim `payload` ke SEMUA subscription tersimpan. Lihat catatan gerbang
   * validasi di atas file ini — fungsi ini sendiri tidak tahu dan tidak
   * peduli siapa/apa yang memanggilnya, itu tanggung jawab caller.
   */
  static async dispatch(payload: NotificationPayload): Promise<DispatchResult> {
    const subscriptions = await prisma.pushSubscription.findMany();

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        )
      )
    );

    // Sebelumnya alasan gagal kirim tidak pernah dicatat di mana pun — route
    // cuma balikin angka "failed: 1" tanpa penjelasan, tidak bisa didebug.
    // Sekarang dicatat ke console tiap ada yang gagal (kecuali 404/410, itu
    // memang wajar — subscription kadaluarsa, bukan error yang perlu dilihat).
    results.forEach((result, index) => {
      if (result.status !== "rejected") return;
      const statusCode = (result.reason as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) return;
      console.error(
        `[NotificationService.dispatch] Gagal kirim ke ${subscriptions[index].endpoint.slice(0, 60)}...`,
        result.reason
      );
    });

    // Subscription yang browser/OS sudah anggap kadaluarsa (uninstall, clear
    // data, dll) balikin 404/410 — bersihkan dari DB supaya tidak terus dicoba.
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

    return {
      total: subscriptions.length,
      sent: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };
  }
}
