import type { AlertLevel } from "./dashboard";

export type AlertReviewStatus =
  | "Belum Ditinjau"
  | "Dikonfirmasi"
  | "Ditolak"
  | "Ditindaklanjuti";

export interface AlertReviewer {
  id: string;
  name: string;
  email: string;
}

export interface AlertItem {
  id: string;
  level: AlertLevel;
  source: string;
  description: string | null;
  reviewStatus: AlertReviewStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewer?: AlertReviewer | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlertPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AlertFilterParams {
  page?: number;
  limit?: number;
  severity?: string;
  reviewStatus?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface AlertReviewPayload {
  reviewStatus: "Dikonfirmasi" | "Ditolak" | "Ditindaklanjuti";
}

export interface AlertStatsSummary {
  pending: number;
  confirmed: number;
  rejected: number;
  escalated: number;
  total: number;
}

export interface AlertListResponse {
  data: AlertItem[];
  pagination: AlertPagination;
}
