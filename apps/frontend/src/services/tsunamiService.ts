import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { TsunamiStatus } from "../types/dashboard";

export const tsunamiService = {
  getStatus: async () => {
    const response = await apiClient.get<ApiResponse<TsunamiStatus>>("/tsunamis/status");
    return response.data.data;
  },
};
