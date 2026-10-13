import { apiClient, protectedPath } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type {
  UserRecord,
  UserStatistics,
  RoleItem,
  CreateUserPayload,
  UpdateUserPayload,
  ResetPasswordPayload,
} from "../types/userManagement";

export const userManagementService = {
  getUsers: async (params?: {
    search?: string;
    role?: string;
    status?: string;
  }): Promise<UserRecord[]> => {
    const response = await apiClient.get<ApiResponse<UserRecord[]>>(
      protectedPath("/users"),
      { params }
    );
    return response.data.data;
  },

  getStats: async (): Promise<UserStatistics> => {
    const response = await apiClient.get<ApiResponse<UserStatistics>>(
      protectedPath("/users/stats")
    );
    return response.data.data;
  },

  getRoles: async (): Promise<RoleItem[]> => {
    const response = await apiClient.get<ApiResponse<RoleItem[]>>(
      protectedPath("/users/roles")
    );
    return response.data.data;
  },

  getUserById: async (id: string): Promise<UserRecord> => {
    const response = await apiClient.get<ApiResponse<UserRecord>>(
      protectedPath(`/users/${id}`)
    );
    return response.data.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<UserRecord> => {
    const response = await apiClient.post<ApiResponse<UserRecord>>(
      protectedPath("/users"),
      payload
    );
    return response.data.data;
  },

  updateUser: async (
    id: string,
    payload: UpdateUserPayload
  ): Promise<UserRecord> => {
    const response = await apiClient.put<ApiResponse<UserRecord>>(
      protectedPath(`/users/${id}`),
      payload
    );
    return response.data.data;
  },

  resetPassword: async (
    id: string,
    payload: ResetPasswordPayload
  ): Promise<void> => {
    await apiClient.post(protectedPath(`/users/${id}/reset-password`), payload);
  },

  unlockUser: async (id: string): Promise<UserRecord> => {
    const response = await apiClient.post<ApiResponse<UserRecord>>(
      protectedPath(`/users/${id}/unlock`)
    );
    return response.data.data;
  },
};
