import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { CurrentAlert } from "../types/dashboard";

type ValidateAlertPayload = {
  alertId: string;
  level: string;
  notes?: string;
};

export const alertService = {
  getCurrent: async () => {
    const response = await apiClient.get<ApiResponse<CurrentAlert>>("/alerts/current");
    return response.data.data;
  },
  getHistory: async () => {
    const response = await apiClient.get<ApiResponse<CurrentAlert[]>>("/alerts/history");
    return response.data.data;
  },
  validate: async (payload: ValidateAlertPayload) => {
    const response = await apiClient.post<ApiResponse<CurrentAlert>>("/alerts/validate", payload);
    return response.data.data;
  },
};
