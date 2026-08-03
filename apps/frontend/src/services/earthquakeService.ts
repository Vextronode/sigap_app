import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { Earthquake } from "../types/dashboard";

export const earthquakeService = {
  getIndonesia: async () => {
    const response = await apiClient.get<ApiResponse<Earthquake | null>>("/public/earthquakes/indonesia");
    return response.data.data;
  },
  getWestJava: async () => {
    const response = await apiClient.get<ApiResponse<Earthquake | null>>("/public/earthquakes/west-java");
    return response.data.data;
  },
  getPangandaran: async () => {
    const response = await apiClient.get<ApiResponse<Earthquake | null>>("/public/earthquakes/pangandaran");
    return response.data.data;
  },
  getLatest: async () => earthquakeService.getIndonesia(),
};
