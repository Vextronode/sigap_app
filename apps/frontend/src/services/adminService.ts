import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/api";

export type AdminDashboardStats = {
  activeAlerts: number;
  announcements: number;
  emergencyContacts: number;
  evacuationPoints: number;
};

export const adminService = {
  getDashboard: async () => {
    const response = await apiClient.get<ApiResponse<AdminDashboardStats>>("/admin/dashboard");
    return response.data.data;
  },
};
