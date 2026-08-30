import { apiClient, publicPath } from "./apiClient";
import type { ApiResponse } from "../types/api";

export type NotificationPayload = {
  alertId: string;
  level: "GREEN" | "YELLOW" | "ORANGE" | "RED";
  title: string;
  body: string;
  icon: string;
  image?: string;
  url: string;
  updatedAt: string;
};

export const notificationService = {
  getVapidPublicKey: async () => {
    const response = await apiClient.get<ApiResponse<{ publicKey: string }>>(
      "/public/notifications/vapid-public-key"
    );
    return response.data.data.publicKey;
  },

  getLatest: async () => {
    const response = await apiClient.get<ApiResponse<NotificationPayload | null>>(
      publicPath("/notifications/latest")
    );
    return response.data.data;
  },

  subscribe: async (subscription: PushSubscriptionJSON) => {
    await apiClient.post(publicPath("/notifications/subscribe"), subscription);
  },

  unsubscribe: async (endpoint: string) => {
    await apiClient.post(publicPath("/notifications/unsubscribe"), { endpoint });
  },
};
