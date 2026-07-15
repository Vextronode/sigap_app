import { apiClient } from "./apiClient";
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
    const response = await apiClient.get<ApiResponse<EmergencyContact[]>>("/emergency-contacts");
    return response.data.data;
  },
  create: async (payload: EmergencyContactPayload) => {
    const response = await apiClient.post<ApiResponse<EmergencyContact>>("/emergency-contacts", payload);
    return response.data.data;
  },
  update: async (id: string | number, payload: Partial<EmergencyContactPayload>) => {
    const response = await apiClient.put<ApiResponse<EmergencyContact>>(`/emergency-contacts/${id}`, payload);
    return response.data.data;
  },
  remove: async (id: string | number) => {
    await apiClient.delete(`/emergency-contacts/${id}`);
  },
};
