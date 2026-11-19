import { apiClient, publicPath, protectedPath } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { LoginPayload, LoginResponse } from "../types/dashboard";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(publicPath("/auth/login"), payload);
    return response.data.data;
  },

  // batas waktu pendek agar logout tidak tertahan saat jaringan lambat
  logout: async () => {
    await apiClient.post(protectedPath("/auth/logout"), undefined, { timeout: 3000 });
  },

  changePassword: async (payload: ChangePasswordPayload) => {
    const response = await apiClient.post<ApiResponse<Record<string, never>>>(
      protectedPath("/auth/change-password"),
      payload
    );
    return response.data;
  },
};

