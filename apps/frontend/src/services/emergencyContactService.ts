import { apiClient, protectedPath, publicPath } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type {
  EmergencyContactRecord,
  CreateEmergencyContactPayload,
  UpdateEmergencyContactPayload,
} from "../types/emergencyContact";

export const emergencyContactService = {
  getAll: async (): Promise<EmergencyContactRecord[]> => {
    const response = await apiClient.get<ApiResponse<EmergencyContactRecord[]>>(
      publicPath("/emergency-contacts")
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<EmergencyContactRecord> => {
    const response = await apiClient.get<ApiResponse<EmergencyContactRecord>>(
      protectedPath(`/emergency-contacts/${id}`)
    );
    return response.data.data;
  },

  create: async (
    payload: CreateEmergencyContactPayload
  ): Promise<EmergencyContactRecord> => {
    const response = await apiClient.post<ApiResponse<EmergencyContactRecord>>(
      protectedPath("/emergency-contacts"),
      payload
    );
    return response.data.data;
  },

  update: async (
    id: string,
    payload: UpdateEmergencyContactPayload
  ): Promise<EmergencyContactRecord> => {
    const response = await apiClient.put<ApiResponse<EmergencyContactRecord>>(
      protectedPath(`/emergency-contacts/${id}`),
      payload
    );
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(protectedPath(`/emergency-contacts/${id}`));
  },
};
