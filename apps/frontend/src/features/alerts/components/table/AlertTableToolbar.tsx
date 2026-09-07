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
    <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Cari deskripsi, sumber, atau ID alert..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00247D]/10 focus:border-[#00247D] transition-all"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Severity Select */}
        <select
          value={selectedSeverity}
          onChange={(e) => onSeverityChange(e.target.value)}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00247D]/10 cursor-pointer transition-colors"
          aria-label="Filter Tingkat Bahaya"
        >
          <option value="ALL">Semua Tingkat</option>
          <option value="GREEN">Aman</option>
          <option value="YELLOW">Waspada</option>
          <option value="ORANGE">Siaga</option>
          <option value="RED">Awas</option>
        </select>

        {/* Status Select */}
        <select
          value={selectedReviewStatus}
          onChange={(e) => onReviewStatusChange(e.target.value)}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00247D]/10 cursor-pointer transition-colors"
          aria-label="Filter Status Verifikasi"
        >
          <option value="ALL">Semua Status</option>
          <option value="Belum Ditinjau">Belum Ditinjau</option>
          <option value="Dikonfirmasi">Dikonfirmasi</option>
          <option value="Ditolak">Ditolak</option>
          <option value="Ditindaklanjuti">Ditindaklanjuti</option>
        </select>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            title="Reset Filter"
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset Filter</span>
          </button>
        )}
      </div>
    </div>
  );
};
