import React from "react";
import type { AlertItem, AlertPagination as AlertPaginationType } from "../../../../types/alert";
import { AlertTableToolbar } from "./AlertTableToolbar";
import { AlertTableHeader } from "./AlertTableHeader";
import { AlertTableRow } from "./AlertTableRow";
import { AlertTableSkeleton } from "./AlertTableSkeleton";
import { AlertTableEmpty } from "./AlertTableEmpty";
import { AlertPagination } from "./AlertPagination";

export interface AlertTableProps {
  alerts: AlertItem[];
  pagination?: AlertPaginationType;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  selectedSeverity: string;
  onSeverityChange: (severity: string) => void;
  selectedReviewStatus: string;
  onReviewStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  onSelectAlert: (alert: AlertItem) => void;
  onResetFilters: () => void;
}

export const AlertTable: React.FC<AlertTableProps> = ({
  alerts,
  pagination,
  isLoading = false,
  onPageChange,
  selectedSeverity,
  onSeverityChange,
  selectedReviewStatus,
  onReviewStatusChange,
  searchQuery,
  onSearchChange,
  onSelectAlert,
  onResetFilters,
}) => {
  // Filter lokal jika pengguna mengetik di input pencarian
  const filteredAlerts = alerts.filter((alert) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const descMatch = alert.description?.toLowerCase().includes(q) ?? false;
    const sourceMatch = alert.source.toLowerCase().includes(q);
    const locMatch = alert.location?.toLowerCase().includes(q) ?? false;
    const idMatch = alert.id.toLowerCase().includes(q);
    return descMatch || sourceMatch || locMatch || idMatch;
  });

  // Batas maksimal tiap halaman data adalah 10 baris (data ke-11 masuk ke halaman berikutnya)
  const limit = pagination?.limit ?? 10;
  const pageOffset =
    (pagination?.page ? pagination.page - 1 : 0) * limit;
  const displayedAlerts = filteredAlerts.slice(0, limit);

  const hasActiveFilters =
    selectedSeverity !== "ALL" ||
    selectedReviewStatus !== "ALL" ||
    searchQuery.trim().length > 0;

  return (
    <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl shadow-xs overflow-hidden">
      {/* Search & Filter Toolbar */}
      <AlertTableToolbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedSeverity={selectedSeverity}
        onSeverityChange={onSeverityChange}
        selectedReviewStatus={selectedReviewStatus}
        onReviewStatusChange={onReviewStatusChange}
        onResetFilters={onResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <AlertTableHeader />

          <tbody>
            {isLoading ? (
              <AlertTableSkeleton rowCount={4} />
            ) : displayedAlerts.length === 0 ? (
              <AlertTableEmpty />
            ) : (
              displayedAlerts.map((alert, idx) => (
                <AlertTableRow
                  key={alert.id}
                  alert={alert}
                  index={pageOffset + idx + 1}
                  onSelectAlert={onSelectAlert}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <AlertPagination
        pagination={pagination}
        currentCount={filteredAlerts.length}
        isLoading={isLoading}
        onPageChange={onPageChange}
      />
    </div>
  );
};
