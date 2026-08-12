import type { AlertLevel } from "../../generated/prisma/enums.js";

/** Bentuk `PushSubscriptionJSON` standar dari browser Push API. */
export interface PushSubscriptionInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/** Isi notifikasi siap kirim — dibangun dari alert + data gempa Pangandaran terkait. */
export interface NotificationPayload {
  alertId: string;
  level: AlertLevel;
  title: string;
  body: string;
  icon: string;
  image?: string;
  url: string;
  updatedAt: string;
}

export interface DispatchResult {
  total: number;
  sent: number;
  failed: number;
}
