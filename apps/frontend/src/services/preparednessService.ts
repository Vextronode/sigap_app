import { apiClient, protectedPath, publicPath } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type {
  PreparednessGuideRecord,
  CreatePreparednessGuideInput,
  UpdatePreparednessGuideInput,
} from "../features/preparedness/types/preparedness.types";

export const preparednessService = {
  getAllPublic: async (): Promise<PreparednessGuideRecord[]> => {
    const response = await apiClient.get<ApiResponse<PreparednessGuideRecord[]>>(
      publicPath("/preparedness-guides")
    );
    return response.data.data;
  },

  getAllAdmin: async (): Promise<PreparednessGuideRecord[]> => {
    const response = await apiClient.get<ApiResponse<PreparednessGuideRecord[]>>(
      protectedPath("/preparedness-guides")
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<PreparednessGuideRecord> => {
    const response = await apiClient.get<ApiResponse<PreparednessGuideRecord>>(
      protectedPath(`/preparedness-guides/${id}`)
    );
    return response.data.data;
  },

  create: async (
    payload: CreatePreparednessGuideInput
  ): Promise<PreparednessGuideRecord> => {
    const response = await apiClient.post<ApiResponse<PreparednessGuideRecord>>(
      protectedPath("/preparedness-guides"),
      payload
    );
    return response.data.data;
  },

  update: async (
    id: string,
    payload: UpdatePreparednessGuideInput
  ): Promise<PreparednessGuideRecord> => {
    const response = await apiClient.put<ApiResponse<PreparednessGuideRecord>>(
      protectedPath(`/preparedness-guides/${id}`),
      payload
    );
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(protectedPath(`/preparedness-guides/${id}`));
  },
};
