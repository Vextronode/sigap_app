import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/api";

export type DeviceSystemStatus = {
  level: string;
  status: "ONLINE" | "OFFLINE" | "UNAVAILABLE";
  tone: "safe" | "danger" | "warning" | "neutral";
  label: string;
  description: string;
  totalDevices: number;
  activeDevices: number;
  lastSeen: string | null;
};

export const deviceService = {
  getStatus: async (): Promise<DeviceSystemStatus> => {
    const response = await apiClient.get<ApiResponse<DeviceSystemStatus>>("/public/device/status");
    return response.data.data;
  },
};
