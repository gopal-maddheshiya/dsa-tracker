import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * ProblemPagination
 * Sleek, high-density pagination bar supporting 10/25/50 item chunking,
 * range indicators, and accessible keyboard-navigable page jumps.
 */
export default function ProblemPagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate pagination page numbers with smart ellipsis windowing
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    if (currentPage <= 4) {
      // Near beginning: 1 2 3 4 5 ... total
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      // Near end: 1 ... total-4 total-3 total-2 total-1 total
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      // In middle: 1 ... curr-1 curr curr+1 ... total
      pages.push(1);
      pages.push('...');
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const PAGE_SIZES = [10, 25, 50];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 px-4 py-3 specular-card rounded-2xl">
      {/* Left: Range and Per-page Chunks */}
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-start text-xs text-muted">
        <div>
          Showing{' '}
          <span className="font-mono tabular-nums font-semibold text-text">
            {startItem}–{endItem}
          </span>{' '}
          of{' '}
          <span className="font-mono tabular-nums font-semibold text-text">{totalItems}</span>{' '}
          problems
        </div>

        {/* Chunk Size Selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-line/70">
            <span className="text-[11px] text-muted hidden md:inline">Show:</span>
            <div className="inline-flex items-center bg-surface-2 p-0.5 rounded-lg border border-line">
              {PAGE_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onPageSizeChange(size)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-medium transition-all duration-150 ${
                    pageSize === size
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                  }`}
                  aria-label={`Show ${size} problems per page`}
                  aria-pressed={pageSize === size}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-text-secondary hover:text-text hover:bg-surface-2 border border-transparent hover:border-line disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
          title="First page"
          aria-label="Go to first page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 px-2.5 inline-flex items-center gap-1 rounded-lg text-xs font-mono text-text-secondary hover:text-text hover:bg-surface-2 border border-transparent hover:border-line disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1 mx-0.5">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 text-center font-mono text-xs text-muted select-none"
                >
                  •••
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`h-8 min-w-8 px-2 rounded-lg text-xs font-mono font-medium transition-all duration-150 active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-accent to-accent-hover text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]'
                    : 'text-text-secondary hover:text-text hover:bg-surface-2 border border-transparent hover:border-line'
                }`}
                aria-label={`Go to page ${page}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 px-2.5 inline-flex items-center gap-1 rounded-lg text-xs font-mono text-text-secondary hover:text-text hover:bg-surface-2 border border-transparent hover:border-line disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-text-secondary hover:text-text hover:bg-surface-2 border border-transparent hover:border-line disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
          title="Last page"
          aria-label="Go to last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
