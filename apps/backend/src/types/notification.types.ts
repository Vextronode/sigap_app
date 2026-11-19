import type { AlertLevel } from "../../generated/prisma/enums.js";

/** Bentuk `PushSubscriptionJSON` standar dari browser Push API. */
export interface PushSubscriptionInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/** Isi notifikasi siap kirim, dibangun dari alert dan gempa penentu levelnya. */
export interface NotificationPayload {
  /** null untuk notifikasi kembali aman atau alert yang gagal disimpan. */
  alertId: string | null;
  level: AlertLevel;
  title: string;
  body: string;
  icon: string;
  image?: string;
  url: string;
  updatedAt: string;
  /**
   * Pola getar per level alert (satuan ms, format [getar, jeda, getar, ...]).
   * Dikontrol backend supaya perubahan level di masa depan tidak butuh redeploy frontend.
   * GREEN: [] (tidak pernah di-notif), YELLOW: [200], ORANGE: [200,100,200], RED: [300,100,300,100,300]
   */
  vibrate: number[];
  /**
   * true = notifikasi tetap di tray sampai user tap/dismiss manual.
   * false = OS sembunyikan otomatis setelah beberapa detik.
   * Selalu true untuk level YELLOW/ORANGE/RED agar warga tidak melewatkan peringatan.
   */
  requireInteraction: boolean;
}

/** Notifikasi beserta aturan pengiriman Web Push (TK-06). */
export interface OutgoingNotification {
  payload: NotificationPayload;
  /** Batas waktu layanan push menyimpan notifikasi untuk perangkat yang offline. */
  ttlSeconds: number;
  urgency: "high" | "normal";
}

/** Data alert yang cukup untuk membangun notifikasi, tersimpan maupun belum. */
export interface NotifiableAlert {
  id: string | null;
  level: AlertLevel;
  source: string;
  description: string | null;
  /** Batas masa aktif; null untuk status tsunami resmi. */
  activeUntil: Date | null;
  updatedAt: Date;
}

export interface DispatchResult {
  total: number;
  sent: number;
  failed: number;
}
