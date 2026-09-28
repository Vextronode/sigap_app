import React, { useState, useRef, useEffect } from "react";
import { Search, X, RotateCcw } from "lucide-react";
import { RiFilter3Line } from "react-icons/ri";
import { MdOutlineFileDownload } from "react-icons/md";

interface UserFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  onResetFilters: () => void;
  onExport: () => void;
  totalFiltered: number;
}

export const UserFilterBar: React.FC<UserFilterBarProps> = ({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  onResetFilters,
  onExport,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const activeFilterCount = (role !== "ALL" ? 1 : 0) + (status !== "ALL" ? 1 : 0);
  const isFiltered = activeFilterCount > 0 || search.trim() !== "";

  // Tutup dropdown saat klik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  return (
    <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative">
      {/* Input Pencarian */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama, email, atau peran..."
          className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00247D]/30 dark:focus:ring-blue-500/30 transition-all shadow-2xs"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            aria-label="Bersihkan pencarian"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Tombol Aksi Toolbar: Filter & Ekspor */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Tombol Filter dengan Dropdown Popover */}
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            aria-expanded={isFilterOpen}
            aria-label="Buka opsi filter"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer shadow-2xs ${
              activeFilterCount > 0
                ? "bg-blue-50 dark:bg-blue-950/60 border-[#00247D] text-[#00247D] dark:text-blue-300"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
            }`}
          >
            <RiFilter3Line size={16} className="shrink-0" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#00247D] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Menu Dropdown Filter */}
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-72 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Filter Pengguna
                </span>
                {isFiltered && (
                  <button
                    type="button"
                    onClick={() => {
                      onResetFilters();
                      setIsFilterOpen(false);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="py-3 space-y-3.5">
                {/* Filter Peran */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Peran Akses
                  </label>
                  <select
                    value={role}
                    onChange={(e) => onRoleChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00247D]/30 cursor-pointer"
                  >
                    <option value="ALL">Semua Peran</option>
                    <option value="admin">Administrator</option>
                    <option value="operator">Petugas Lapangan</option>
                  </select>
                </div>

                {/* Filter Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Status Akun
                  </label>
                  <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00247D]/30 cursor-pointer"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="locked">Terkunci (Lockout)</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-2 bg-[#00247D] hover:bg-[#001d66] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tombol Ekspor */}
        <button
          type="button"
          onClick={onExport}
          aria-label="Ekspor data pengguna ke CSV / Excel"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all cursor-pointer shadow-2xs"
        >
          <MdOutlineFileDownload size={17} className="shrink-0" />
          <span>Ekspor</span>
        </button>
      </div>
    </div>
  );
};
