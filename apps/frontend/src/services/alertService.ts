import { apiClient, protectedPath, publicPath } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { CurrentAlert } from "../types/dashboard";
import type {
  AlertFilterParams,
  AlertItem,
  AlertListResponse,
  AlertPagination,
  AlertReviewPayload,
  AlertStatsSummary,
} from "../types/alert";

interface AlertListApiResponse extends ApiResponse<AlertItem[]> {
  pagination: AlertPagination;
}

export const alertService = {
  getCurrent: async () => {
    const response = await apiClient.get<ApiResponse<CurrentAlert | null>>(
      publicPath("/alerts/current")
    );
    return response.data.data;
  },
  getHistory: async () => {
    const response = await apiClient.get<ApiResponse<CurrentAlert[]>>(
      publicPath("/alerts/history")
    );
    return response.data.data;
  },
  getFiltered: async (params?: AlertFilterParams): Promise<AlertListResponse> => {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.severity && params.severity !== "ALL") queryParams.severity = params.severity;
    if (params?.reviewStatus && params.reviewStatus !== "ALL") queryParams.reviewStatus = params.reviewStatus;
    if (params?.startDate) queryParams.startDate = params.startDate;
    if (params?.endDate) queryParams.endDate = params.endDate;

    const response = await apiClient.get<AlertListApiResponse>(
      protectedPath("/alerts"),
      { params: queryParams }
    );
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },
  getById: async (id: string): Promise<AlertItem> => {
    const response = await apiClient.get<ApiResponse<AlertItem>>(
      protectedPath(`/alerts/${id}`)
    );
    return response.data.data;
  },
  review: async (id: string, payload: AlertReviewPayload): Promise<AlertItem> => {
    const response = await apiClient.patch<ApiResponse<AlertItem>>(
      protectedPath(`/alerts/${id}/review`),
      payload
    );
    return response.data.data;
  },
  getStats: async (): Promise<AlertStatsSummary> => {
    const [pendingRes, confirmedRes, rejectedRes, escalatedRes] = await Promise.all([
      alertService.getFiltered({ limit: 1, reviewStatus: "Belum Ditinjau" }),
      alertService.getFiltered({ limit: 1, reviewStatus: "Dikonfirmasi" }),
      alertService.getFiltered({ limit: 1, reviewStatus: "Ditolak" }),
      alertService.getFiltered({ limit: 1, reviewStatus: "Ditindaklanjuti" }),
    ]);

    const pending = pendingRes.pagination.total;
    const confirmed = confirmedRes.pagination.total;
    const rejected = rejectedRes.pagination.total;
    const escalated = escalatedRes.pagination.total;
    const total = pending + confirmed + rejected + escalated;

    return {
      pending,
      confirmed,
      rejected,
      escalated,
      total,
    };
  },
};