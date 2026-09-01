import { apiClient, publicPath } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { AiSummary } from "../types/dashboard";

export const summaryService = {
  getWeatherSummary: async () => {
    const response = await apiClient.get<ApiResponse<AiSummary>>(publicPath("/ai-summary"), {
      params: { type: "weather" },
    });
    return response.data.data;
  },
};
