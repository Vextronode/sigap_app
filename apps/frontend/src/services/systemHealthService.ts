import { apiClient, publicPath } from "./apiClient";
import type { ApiResponse } from "../types/api";

export interface ServiceHealthItem {
  name: string;
  category: "weather" | "earthquake" | "sid" | "push" | "database";
  status: "ONLINE" | "STANDBY" | "OFFLINE";
  provider: string;
  latencyMs: number;
  message: string;
  lastChecked: string;
}

export interface SystemHealthData {
  services: ServiceHealthItem[];
  overallStatus: "HEALTHY" | "DEGRADED";
  checkedAt: string;
}

export const systemHealthService = {
  getHealth: async (): Promise<SystemHealthData> => {
    const response = await apiClient.get<ApiResponse<SystemHealthData>>(
      publicPath("/system-health")
    );
    return response.data.data;
  },
};
