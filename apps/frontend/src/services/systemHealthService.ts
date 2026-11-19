import { apiClient, publicPath } from "./apiClient";
import type { ApiResponse } from "../types/api";

export interface ServiceHealthItem {
  name: string;
  category: "weather" | "earthquake" | "sid" | "push" | "database" | "scheduler";
  status: "ONLINE" | "STANDBY" | "OFFLINE";
  provider: string;
  /** null bila tidak diukur atau pengecekan gagal. */
  latencyMs: number | null;
  message: string;
  lastChecked: string;
}

export type SchedulerState = "MEMULAI" | "AKTIF" | "TERLAMBAT" | "GAGAL" | "TIDAK_AKTIF";

export interface SchedulerStatus {
  state: SchedulerState;
  enabled: boolean;
  intervalMs: number;
  running: boolean;
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  consecutiveFailures: number;
}

export interface SystemHealthData {
  services: ServiceHealthItem[];
  scheduler: SchedulerStatus;
  overallStatus: "HEALTHY" | "DEGRADED";
  checkedAt: string;
}

/** Scheduler sehat: siklus berjalan normal atau baru dimulai. */
export const isSchedulerStateHealthy = (state: SchedulerState) =>
  state === "AKTIF" || state === "MEMULAI";

export const systemHealthService = {
  getHealth: async (): Promise<SystemHealthData> => {
    const response = await apiClient.get<ApiResponse<SystemHealthData>>(
      publicPath("/system-health")
    );
    return response.data.data;
  },
};
