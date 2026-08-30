import { apiClient, protectedPath, publicPath } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { EvacuationPoint, EvacuationRoute } from "../types/dashboard";

type EvacuationPointPayload = {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  capacity?: number;
  address?: string;
};

type EvacuationRoutePayload = {
  routeName: string;
  description?: string;
  geometry: unknown;
  destinationPointId?: string | number;
};

export const evacuationService = {
  getPoints: async () => {
    const response = await apiClient.get<ApiResponse<EvacuationPoint[]>>(publicPath("/evacuation-points"));
    return response.data.data;
  },
  getRoutes: async () => {
    const response = await apiClient.get<ApiResponse<EvacuationRoute[]>>(publicPath("/evacuation-routes"));
    return response.data.data;
  },
  createPoint: async (payload: EvacuationPointPayload) => {
    const response = await apiClient.post<ApiResponse<EvacuationPoint>>(protectedPath("/evacuation-points"), payload);
    return response.data.data;
  },
  updatePoint: async (id: string | number, payload: Partial<EvacuationPointPayload>) => {
    const response = await apiClient.put<ApiResponse<EvacuationPoint>>(protectedPath(`/evacuation-points/${id}`), payload);
    return response.data.data;
  },
  removePoint: async (id: string | number) => {
    await apiClient.delete(protectedPath(`/evacuation-points/${id}`));
  },
  createRoute: async (payload: EvacuationRoutePayload) => {
    const response = await apiClient.post<ApiResponse<EvacuationRoute>>(protectedPath("/evacuation-routes"), payload);
    return response.data.data;
  },
  updateRoute: async (id: string | number, payload: Partial<EvacuationRoutePayload>) => {
    const response = await apiClient.put<ApiResponse<EvacuationRoute>>(protectedPath(`/evacuation-routes/${id}`), payload);
    return response.data.data;
  },
  removeRoute: async (id: string | number) => {
    await apiClient.delete(protectedPath(`/evacuation-routes/${id}`));
  },
};
