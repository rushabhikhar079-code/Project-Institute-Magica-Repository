// src/components/common/DataTable/TablePagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;

  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const Pagination = ({
  currentPage,
  pageSize,
  totalCount,
  totalPages,
  hasPrevious,
  hasNext,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) => {
  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalCount);

  // 🎯 Helper function to calculate truncated page window
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const siblingCount = 1;

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    // First page
    pages.push(1);

    // Left dots
    if (shouldShowLeftDots) {
      pages.push("...");
    }

    // Middle pages
    const startPage = shouldShowLeftDots ? leftSiblingIndex : 2;
    const endPage = shouldShowRightDots ? rightSiblingIndex : totalPages - 1;

    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    // Right dots
    if (shouldShowRightDots) {
      pages.push("...");
    }

    // Last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-white">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Page size */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>

            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <span className="text-sm text-gray-600">entries</span>
          </div>

          {/* Showing */}
          <div className="text-sm text-gray-600">
            Showing {startEntry} to {endEntry} of {totalCount} entries
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Previous */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious}
            className={`flex items-center gap-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
              !hasPrevious
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Truncated Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) =>
              typeof page === "number" ? (
                <button
                  type="button"
                  key={index}
                  onClick={() => onPageChange(page)}
                  className={`min-w-[36px] h-9 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-[#0F4C81] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span
                  key={index}
                  className="px-2 py-1 text-sm text-gray-400 font-medium select-none"
                >
                  {page}
                </span>
              ),
            )}
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
            className={`flex items-center gap-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
              !hasNext
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
