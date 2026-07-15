import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { LoginPayload, LoginResponse } from "../types/dashboard";

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", payload);
    return response.data.data;
  },
};
