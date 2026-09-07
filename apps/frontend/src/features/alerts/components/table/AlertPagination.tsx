import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AlertPagination as AlertPaginationType } from "../../../../types/alert";

interface AlertPaginationProps {
  pagination?: AlertPaginationType;
  currentCount: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

export const AlertPagination: React.FC<AlertPaginationProps> = ({
  pagination,
  currentCount,
  isLoading = false,
  onPageChange,
}) => {
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const totalItems = pagination?.total ?? 0;
  const limit = pagination?.limit ?? 10;

  const fromIndex = totalItems > 0 ? (currentPage - 1) * limit + 1 : 0;
  const toIndex = totalItems > 0 ? Math.min(fromIndex + currentCount - 1, totalItems) : 0;

  // Render list of page numbers to match Figma: [1, 2, '...', totalPages]
  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 2) {
        pages.push(currentPage === 3 ? 2 : "...");
      }
      if (currentPage !== 1 && currentPage !== totalPages) {
        pages.push(currentPage);
      }
      if (currentPage < totalPages - 1) {
        pages.push(currentPage === totalPages - 2 ? totalPages - 1 : "...");
      }
      pages.push(totalPages);
    }

    // Deduplicate consecutive elements
    return pages.filter((item, idx, arr) => item !== arr[idx - 1]);
  };

  return (
    <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white">
      {/* Left text: Menampilkan X-Y dari Z data */}
      <div>
        Menampilkan{" "}
        <span className="font-semibold text-slate-800">
          {totalItems > 0 ? `${fromIndex}-${toIndex}` : "0"}
        </span>{" "}
        dari{" "}
        <span className="font-semibold text-slate-800">
          {totalItems}
        </span>{" "}
        data
      </div>

      {/* Right controls: < 1 2 ... > */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1 || isLoading}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        {renderPageNumbers().map((item, idx) => {
          if (item === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 select-none">
                ...
              </span>
            );
          }

          const pageNum = Number(item);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#00247D] text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages || isLoading}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
