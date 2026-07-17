import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { Announcement } from "../types/dashboard";

type AnnouncementPayload = {
  title: string;
  content: string;
  priority: string;
  publishedAt?: string;
};

export const announcementService = {
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<Announcement[]>>("/announcements");
    return response.data.data;
  },
  create: async (payload: AnnouncementPayload) => {
    const response = await apiClient.post<ApiResponse<Announcement>>("/announcements", payload);
    return response.data.data;
  },
  update: async (id: string | number, payload: Partial<AnnouncementPayload>) => {
    const response = await apiClient.put<ApiResponse<Announcement>>(`/announcements/${id}`, payload);
    return response.data.data;
  },
  remove: async (id: string | number) => {
    await apiClient.delete(`/announcements/${id}`);
  },
};
