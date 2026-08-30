import { apiClient, publicPath } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { Earthquake } from "../types/dashboard";

export const earthquakeService = {
  getIndonesia: async () => {
    const response = await apiClient.get<ApiResponse<Earthquake | null>>(publicPath("/earthquakes/indonesia"));
    return response.data.data;
  },
  getWestJava: async () => {
    const response = await apiClient.get<ApiResponse<Earthquake | null>>(publicPath("/earthquakes/west-java"));
    return response.data.data;
  },
  getPangandaran: async () => {
    const response = await apiClient.get<ApiResponse<Earthquake | null>>(publicPath("/earthquakes/pangandaran"));
    return response.data.data;
  },
  getLatest: async () => earthquakeService.getIndonesia(),
};
