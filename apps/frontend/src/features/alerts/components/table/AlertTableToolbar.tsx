import React from "react";
import { Search, RotateCcw } from "lucide-react";

interface AlertTableToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSeverity: string;
  onSeverityChange: (severity: string) => void;
  selectedReviewStatus: string;
  onReviewStatusChange: (status: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const AlertTableToolbar: React.FC<AlertTableToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSeverity,
  onSeverityChange,
  selectedReviewStatus,
  onReviewStatusChange,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="p-4 sm:p-5 border-b border-[color:var(--border)] flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-[color:var(--surface)]">
      {/* Table Section Title */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm sm:text-base font-bold text-[color:var(--text)] tracking-tight whitespace-nowrap">
          Data Gempa Pangandaran
        </h3>
      </div>

      {/* Controls: Search & Filters */}
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-full sm:max-w-xs md:max-w-sm">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Cari parameter gempa, magnitudo, lokasi..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs placeholder:text-[11px] sm:placeholder:text-xs rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--text)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)] transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Severity Select */}
          <select
            value={selectedSeverity}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--text)] hover:bg-[color:var(--surface-muted)]/80 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 cursor-pointer transition-colors"
            aria-label="Filter Tingkat Bahaya"
          >
            <option value="ALL" className="bg-[color:var(--surface)] text-[color:var(--text)]">Semua Tingkat</option>
            <option value="GREEN" className="bg-[color:var(--surface)] text-[color:var(--text)]">Aman</option>
            <option value="YELLOW" className="bg-[color:var(--surface)] text-[color:var(--text)]">Waspada</option>
            <option value="ORANGE" className="bg-[color:var(--surface)] text-[color:var(--text)]">Siaga</option>
            <option value="RED" className="bg-[color:var(--surface)] text-[color:var(--text)]">Awas</option>
          </select>

          {/* Status Select */}
          <select
            value={selectedReviewStatus}
            onChange={(e) => onReviewStatusChange(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--text)] hover:bg-[color:var(--surface-muted)]/80 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 cursor-pointer transition-colors"
            aria-label="Filter Status Verifikasi"
          >
            <option value="ALL" className="bg-[color:var(--surface)] text-[color:var(--text)]">Semua Status</option>
            <option value="Belum Diverifikasi" className="bg-[color:var(--surface)] text-[color:var(--text)]">Belum Diverifikasi</option>
            <option value="Dikonfirmasi" className="bg-[color:var(--surface)] text-[color:var(--text)]">Dikonfirmasi</option>
            <option value="Ditolak" className="bg-[color:var(--surface)] text-[color:var(--text)]">Ditolak</option>
            <option value="Ditindaklanjuti" className="bg-[color:var(--surface)] text-[color:var(--text)]">Ditindaklanjuti</option>
          </select>

          {/* Reset Filter Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              title="Reset Filter"
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
