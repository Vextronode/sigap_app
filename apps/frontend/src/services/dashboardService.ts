import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { DashboardData } from "../types/dashboard";

export const dashboardService = {
  getDashboard: async () => {
    const response = await apiClient.get<ApiResponse<DashboardData>>("/dashboard");
    return response.data.data;
  },
};
