import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { AiSummary } from "../types/dashboard";

export const summaryService = {
  getWeatherSummary: async () => {
    const response = await apiClient.get<ApiResponse<AiSummary>>("/summaries/weather");
    return response.data.data;
  },
};
