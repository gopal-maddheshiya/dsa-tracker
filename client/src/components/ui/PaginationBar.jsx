import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationBar = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'problems',
  pageSizeOptions = [10, 25, 50, 'all'],
}) => {
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (pageSize === 'all' ? 1 : Math.min((currentPage - 1) * pageSize + 1, totalItems));
  const endItem = pageSize === 'all' ? totalItems : Math.min(currentPage * pageSize, totalItems);

  // Generate smart page pills list with ellipsis for clean desktop rendering
  const pages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [totalPages, currentPage]);

  if (totalItems <= 0) return null;

  return (
    <div className="p-3 sm:px-4 sm:py-2.5 border border-line bg-surface rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 overflow-hidden">
      {/* Left: Range Info (No bullet dot) & Mobile Page Size */}
      <div className="flex items-center justify-between sm:justify-start gap-3">
        <div className="text-xs flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-muted">Showing</span>
          <span className="font-semibold text-text tabular-nums">{startItem}–{endItem}</span>
          <span className="text-muted">of</span>
          <span className="font-semibold text-text tabular-nums">{totalItems}</span>
          <span className="text-muted hidden md:inline">{itemLabel}</span>
        </div>

        {/* Mobile Page Size Toggle */}
        <div className="sm:hidden flex items-center p-0.5 rounded-lg bg-surface-2 border border-line shrink-0">
          {pageSizeOptions.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                onPageSizeChange(size);
                onPageChange(1);
              }}
              className={`h-6 px-2 flex items-center justify-center text-xs rounded-md transition-all cursor-pointer ${
                pageSize === size
                  ? 'bg-surface text-text font-semibold border border-line shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              {size === 'all' ? 'All' : size}
            </button>
          ))}
        </div>
      </div>

      {/* Center: Prev / Page Pills / Next */}
      {totalPages > 1 && (
        <div className="grid grid-cols-[1fr_auto_1fr] sm:flex items-center justify-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="h-8 px-2.5 sm:px-3 rounded-lg border border-line bg-surface-2 hover:bg-surface-2/80 text-text text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Desktop Numeric Page Pills */}
          <div className="hidden md:flex items-center gap-1">
            {pages.map((p, idx) => {
              if (p === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-7 text-center text-xs text-muted select-none"
                  >
                    …
                  </span>
                );
              }
              const isActive = currentPage === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold tabular-nums flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-accent text-white shadow-xs font-bold'
                      : 'text-secondary hover:text-text hover:bg-surface-2 border border-transparent hover:border-line'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Mobile / Tablet Page Counter */}
          <div className="md:hidden px-3 h-8 flex items-center justify-center text-xs font-semibold text-text bg-surface-2 border border-line rounded-lg tabular-nums">
            <span className="text-text">{currentPage}</span>
            <span className="text-muted mx-1 font-normal">/</span>
            <span className="text-muted">{totalPages}</span>
          </div>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="h-8 px-2.5 sm:px-3 rounded-lg border border-line bg-surface-2 hover:bg-surface-2/80 text-text text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            title="Next Page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Right: Desktop Per Page Selector */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted">Per page:</span>
        <div className="h-8 flex items-center p-0.5 rounded-lg bg-surface-2 border border-line">
          {pageSizeOptions.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                onPageSizeChange(size);
                onPageChange(1);
              }}
              className={`h-7 px-2.5 flex items-center justify-center text-xs rounded-md transition-all cursor-pointer ${
                pageSize === size
                  ? 'bg-surface text-text font-semibold border border-line shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              {size === 'all' ? 'All' : size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaginationBar;
