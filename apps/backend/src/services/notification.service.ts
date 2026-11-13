/**
 * Push Notification (Web Push) — SIGAP mengirim langsung ke warga, TIDAK
 * lewat SID. Alasan: notifikasi SID yang sudah ada itu untuk kasus berbeda
 * (info pengajuan surat diterima/ditolak admin desa), dan belum ada
 * kepastian tim SID mau/bisa menangani notifikasi kesiapsiagaan bencana.
 * Daripada bergantung ke tim lain yang belum pasti, SIGAP bangun sendiri.
 *
 * Scheduler (`alert.scheduler.ts`) mengirim notifikasi otomatis untuk alert baru
 * yang diizinkan aturan rentetan (ADR-046) dan notifikasi kembali aman setelah
 * peringatan SIAGA atau AWAS berakhir (ADR-047). Setiap pengiriman dicatat ke
 * `notification_logs`.
 */
import { prisma } from "../config/prisma.js";
import { webpush } from "../config/webPush.js";
import {
  ALERT_ACTIVE_MAX_AGE_MS,
  ESTIMATED_TSUNAMI_SOURCE,
  OFFICIAL_TSUNAMI_SOURCE,
} from "../config/alertRules.js";
import { AlertService, LIVE_FALLBACK_ALERT_ID, alertActiveUntil } from "./alert.service.js";
import { EarthquakeService } from "./earthquake.service.js";
import { NotificationLogRepository } from "../repositories/notificationLog.repository.js";
import { SEVERITY_TO_LABEL } from "../repositories/alert.repository.js";
import { AlertLevel } from "../../generated/prisma/enums.js";
import type { EarthquakeInfo } from "../types/earthquake.types.js";
import type {
  DispatchResult,
  NotifiableAlert,
  NotificationPayload,
  OutgoingNotification,
  PushSubscriptionInput,
} from "../types/notification.types.js";

/**
 * Pola getar (vibrate) per level alert, satuan ms.
 * Format: [durasi_getar, durasi_jeda, durasi_getar, ...]
 */
const VIBRATION_PATTERNS: Record<AlertLevel, number[]> = {
  GREEN:  [],
  YELLOW: [200],
  ORANGE: [200, 100, 200],
  RED:    [300, 100, 300, 100, 300],
};

/** TTL minimum agar notifikasi alert yang hampir berakhir masih sempat terkirim. */
const MIN_TTL_SECONDS = 60;

/** TTL status tsunami resmi dan notifikasi kembali aman: 24 jam. */
const DEFAULT_TTL_SECONDS = ALERT_ACTIVE_MAX_AGE_MS / 1000;

const ICON = "/assets/icons/icon-192.png";

const ALL_CLEAR_BODY =
  "Tidak ada gempa aktif maupun status tsunami yang berlaku. Tetap pantau informasi resmi BMKG.";

/** Level yang memicu notifikasi kembali aman saat peringatan berakhir (ADR-047). */
const ALL_CLEAR_AFTER_LEVELS: ReadonlySet<AlertLevel> = new Set([AlertLevel.ORANGE, AlertLevel.RED]);

/**
 * Notifikasi SIAGA atau AWAS yang lebih lama dari 48 jam (masa aktif 24 jam ditambah
 * 24 jam) tidak lagi diikuti notifikasi kembali aman, agar log lama tidak memicu
 * pesan yang sudah tidak relevan (ADR-047).
 */
const ALL_CLEAR_LOOKBACK_MS = 2 * ALERT_ACTIVE_MAX_AGE_MS;

const parseMagnitude = (description: string | null): number | null => {
  const match = description?.match(/M(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
};

/** Alert dari deskripsi gempa Decision Engine ("Gempa M..."). */
const isEarthquakeAlert = (alert: NotifiableAlert) => /^Gempa M\d/.test(alert.description ?? "");

const buildTitle = (alert: NotifiableAlert): string => {
  const label = `[${SEVERITY_TO_LABEL[alert.level].toUpperCase()}]`;
  if (alert.level === AlertLevel.GREEN) return `${label} Peringatan telah berakhir`;
  if (alert.source === OFFICIAL_TSUNAMI_SOURCE) return `${label} Status tsunami dari BMKG`;
  if (alert.source === ESTIMATED_TSUNAMI_SOURCE) return `${label} Estimasi potensi tsunami dari data gempa`;
  if (isEarthquakeAlert(alert)) {
    const magnitude = parseMagnitude(alert.description);
    const subject = magnitude !== null ? `Gempa M${magnitude}` : "Gempa";
    const verb = alert.level === AlertLevel.ORANGE ? "dirasakan" : "terdeteksi";
    return `${label} ${subject} ${verb} di sekitar Desa Cibenda`;
  }
  return `${label} Peringatan kesiapsiagaan bencana`;
};

/** Sisa masa aktif alert, minimum 60 detik; 24 jam bila alert tidak punya batas masa aktif. */
const ttlFor = (alert: NotifiableAlert, now: Date): number => {
  if (alert.level === AlertLevel.GREEN || !alert.activeUntil) return DEFAULT_TTL_SECONDS;
  const remaining = Math.floor((alert.activeUntil.getTime() - now.getTime()) / 1000);
  return Math.max(MIN_TTL_SECONDS, remaining);
};

/**
 * Gempa penentu level: gempa aktif dengan magnitudo yang disebut deskripsi alert,
 * kejadian terbaru lebih dulu. null bila tidak ada yang cocok.
 */
export const findDeterminingEarthquake = (
  alert: NotifiableAlert,
  earthquakes: EarthquakeInfo[]
): EarthquakeInfo | null => {
  const magnitude = parseMagnitude(alert.description);
  if (magnitude === null || !isEarthquakeAlert(alert)) return null;
  return (
    earthquakes
      .filter((earthquake) => Math.abs(earthquake.magnitude - magnitude) < 0.05)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0] ?? null
  );
};

/** Data notifikasi dari rekaman alert; id hasil evaluasi langsung tidak dicatat sebagai alertId. */
export const toNotifiableAlert = (alert: {
  id: string | null;
  level: AlertLevel;
  source: string;
  description: string | null;
  eventTime?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): NotifiableAlert => ({
  id: alert.id === LIVE_FALLBACK_ALERT_ID ? null : alert.id,
  level: alert.level,
  source: alert.source,
  description: alert.description,
  activeUntil: alertActiveUntil(alert),
  updatedAt: alert.updatedAt,
});

/** Notifikasi terakhir yang tercatat; undefined bila belum dibaca dari database. */
let lastSent: { level: AlertLevel; sentAt: Date } | null | undefined;

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
   * Mengambil total subscriber aktif push notification warga desa.
   */
  static async getSubscriberCount(): Promise<number> {
    try {
      return await prisma.pushSubscription.count();
    } catch {
      return 0;
    }
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
   * Alert yang dikirim sebagai peringatan: YELLOW/ORANGE/RED (Waspada/Siaga/Awas).
   * GREEN hanya dikirim sebagai notifikasi kembali aman (lihat isAllClearDue).
   */
  static shouldNotify(level: AlertLevel): boolean {
    return level !== AlertLevel.GREEN;
  }

  /**
   * Notifikasi untuk alert, dengan aturan pengiriman Web Push (ADR-047):
   * judul per jenis ancaman, gambar shakemap hanya dari gempa penentu level,
   * TTL sesuai sisa masa aktif alert, dan urgency tinggi untuk SIAGA dan AWAS.
   */
  static buildNotification(
    alert: NotifiableAlert,
    determiningEarthquake: EarthquakeInfo | null = null,
    now: Date = new Date()
  ): OutgoingNotification {
    const isAllClear = alert.level === AlertLevel.GREEN;
    const payload: NotificationPayload = {
      alertId: isAllClear ? null : alert.id,
      level: alert.level,
      title: buildTitle(alert),
      body: isAllClear
        ? ALL_CLEAR_BODY
        : alert.description || "Pantau kondisi terkini di dashboard SIGAP.",
      icon: ICON,
      image: determiningEarthquake?.shakemap || undefined,
      url: "/",
      updatedAt: (isAllClear ? now : alert.updatedAt).toISOString(),
      vibrate: VIBRATION_PATTERNS[alert.level],
      requireInteraction: !isAllClear,
    };
    return {
      payload,
      ttlSeconds: ttlFor(alert, now),
      urgency:
        alert.level === AlertLevel.ORANGE || alert.level === AlertLevel.RED ? "high" : "normal",
    };
  }

  /** Notifikasi kembali aman setelah peringatan SIAGA atau AWAS berakhir (ADR-047). */
  static buildAllClearNotification(now: Date = new Date()): OutgoingNotification {
    return this.buildNotification(
      {
        id: null,
        level: AlertLevel.GREEN,
        source: "BMKG",
        description: null,
        activeUntil: null,
        updatedAt: now,
      },
      null,
      now
    );
  }

  /**
   * true bila notifikasi terakhir berlevel SIAGA atau AWAS, paling lama 48 jam lalu.
   * Log dibaca dari database sekali, lalu diperbarui di memori setiap dispatch.
   */
  static async isAllClearDue(now: Date = new Date()): Promise<boolean> {
    if (lastSent === undefined) {
      try {
        lastSent = await NotificationLogRepository.findLatest();
      } catch (error) {
        console.warn(
          "[NotificationService] Gagal membaca log notifikasi terakhir:",
          error instanceof Error ? error.message : error
        );
        return false;
      }
    }
    return (
      !!lastSent &&
      ALL_CLEAR_AFTER_LEVELS.has(lastSent.level) &&
      now.getTime() - lastSent.sentAt.getTime() <= ALL_CLEAR_LOOKBACK_MS
    );
  }

  /** Mengosongkan catatan notifikasi terakhir di memori (dipakai tes). */
  static resetLastSent(): void {
    lastSent = undefined;
  }

  /**
   * Notifikasi untuk alert yang berlaku saat ini (alert yang sama dengan dashboard).
   * null bila data peringatan tidak tersedia.
   */
  static async getLatestNotification(): Promise<OutgoingNotification | null> {
    const alert = await AlertService.getCurrentAlert();
    // UNKNOWN berarti data tidak tersedia, bukan peringatan yang perlu dikirim.
    if (!alert || alert.level === "UNKNOWN") return null;
    if (alert.level === AlertLevel.GREEN) return this.buildAllClearNotification();

    const notifiable = toNotifiableAlert({ ...alert, level: alert.level });
    let determining: EarthquakeInfo | null = null;
    if (isEarthquakeAlert(notifiable)) {
      try {
        determining = findDeterminingEarthquake(notifiable, await EarthquakeService.getActiveEvents());
      } catch (error) {
        console.warn(
          "[NotificationService] Gagal mengambil gempa aktif untuk shakemap:",
          error instanceof Error ? error.message : error
        );
      }
    }
    return this.buildNotification(notifiable, determining);
  }

  /** Isi notifikasi untuk alert yang berlaku saat ini (GET /notifications/latest). */
  static async getLatestPayload(): Promise<NotificationPayload | null> {
    return (await this.getLatestNotification())?.payload ?? null;
  }

  /**
   * Kirim notifikasi ke semua subscription tersimpan dengan TTL dan urgency
   * Web Push, lalu simpan jejak audit ke `notification_logs`.
   */
  static async dispatch(
    notification: OutgoingNotification,
    triggeredBy = "CRON_SCHEDULER"
  ): Promise<DispatchResult> {
    const { payload } = notification;
    const subscriptions = await prisma.pushSubscription.findMany();

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
          { TTL: notification.ttlSeconds, urgency: notification.urgency }
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
          level: payload.level,
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
    lastSent = { level: payload.level, sentAt: new Date() };

    return {
      total: subscriptions.length,
      sent: sentCount,
      failed: failedCount,
    };
  }
}
