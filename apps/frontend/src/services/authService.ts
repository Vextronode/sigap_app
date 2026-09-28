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

  changePassword: async (payload: ChangePasswordPayload) => {
    const response = await apiClient.post<ApiResponse<Record<string, never>>>(
      protectedPath("/auth/change-password"),
      payload
    );
    return response.data;
  },
};

