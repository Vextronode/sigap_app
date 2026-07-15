import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { Earthquake } from "../types/dashboard";

export const earthquakeService = {
  getLatest: async () => {
    const response = await apiClient.get<ApiResponse<Earthquake>>("/earthquakes/latest");
    return response.data.data;
  },
};
