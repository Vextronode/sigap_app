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
    const idMatch = alert.id.toLowerCase().includes(q);
    return descMatch || sourceMatch || idMatch;
  });

  const hasActiveFilters =
    selectedSeverity !== "ALL" ||
    selectedReviewStatus !== "ALL" ||
    searchQuery.trim().length > 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
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
            ) : filteredAlerts.length === 0 ? (
              <AlertTableEmpty />
            ) : (
              filteredAlerts.map((alert) => (
                <AlertTableRow
                  key={alert.id}
                  alert={alert}
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
