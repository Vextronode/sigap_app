import { apiClient, protectedPath, publicPath } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { EmergencyContact } from "../types/dashboard";

type EmergencyContactPayload = {
  institution: string;
  contactPerson?: string;
  phoneNumber: string;
  address?: string;
};

export const emergencyContactService = {
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<EmergencyContact[]>>(publicPath("/emergency-contacts"));
    return response.data.data;
  },
  create: async (payload: EmergencyContactPayload) => {
    const response = await apiClient.post<ApiResponse<EmergencyContact>>(protectedPath("/emergency-contacts"), payload);
    return response.data.data;
  },
  update: async (id: string | number, payload: Partial<EmergencyContactPayload>) => {
    const response = await apiClient.put<ApiResponse<EmergencyContact>>(protectedPath(`/emergency-contacts/${id}`), payload);
    return response.data.data;
  },
  remove: async (id: string | number) => {
    await apiClient.delete(protectedPath(`/emergency-contacts/${id}`));
  },
};
