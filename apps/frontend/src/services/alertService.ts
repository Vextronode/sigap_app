import { apiClient, protectedPath, publicPath } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { CurrentAlert } from "../types/dashboard";

type ReviewAlertPayload = {
  reviewStatus: "Dikonfirmasi" | "Ditolak" | "Ditindaklanjuti";
};

export const alertService = {
  getCurrent: async () => {
    const response = await apiClient.get<ApiResponse<CurrentAlert | null>>(publicPath("/alerts/current"));
    return response.data.data;
  },
  getHistory: async () => {
    const response = await apiClient.get<ApiResponse<CurrentAlert[]>>(publicPath("/alerts/history"));
    return response.data.data;
  },
  review: async (id: string, payload: ReviewAlertPayload) => {
    const response = await apiClient.patch<ApiResponse<CurrentAlert>>(protectedPath(`/alerts/${id}/review`), payload);
    return response.data.data;
  },
};