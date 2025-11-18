"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath?: string;
};

export function Pagination({
  currentPage,
  totalPages,
  basePath = "/books",
}: PaginationProps) {
  const searchParams = useSearchParams();

  // Don't render if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    return `${basePath}?${params.toString()}`;
  };

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-1.5 sm:gap-2"
      aria-label="التنقل بين الصفحات"
    >
      {/* Previous button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="flex min-h-[40px] items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-[color:var(--color-foreground)] transition active:bg-gray-50 hover:bg-gray-50 sm:px-4 sm:text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          <span className="hidden sm:inline">السابق</span>
        </Link>
      ) : (
        <span className="flex min-h-[40px] items-center gap-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-400 cursor-not-allowed sm:px-4 sm:text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          <span className="hidden sm:inline">السابق</span>
        </span>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-1.5 py-2 text-xs text-[color:var(--color-foreground-muted)] sm:px-2 sm:text-sm"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Link
              key={pageNum}
              href={createPageUrl(pageNum)}
              className={`flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-xs font-medium transition active:opacity-80 sm:h-10 sm:w-10 sm:text-sm ${
                isActive
                  ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
                  : "border border-gray-300 bg-white text-[color:var(--color-foreground)] active:bg-gray-50 hover:bg-gray-50"
              }`}
              aria-label={`الصفحة ${pageNum}`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="flex min-h-[40px] items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-[color:var(--color-foreground)] transition active:bg-gray-50 hover:bg-gray-50 sm:px-4 sm:text-sm"
        >
          <span className="hidden sm:inline">التالي</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </Link>
      ) : (
        <span className="flex min-h-[40px] items-center gap-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-400 cursor-not-allowed sm:px-4 sm:text-sm">
          <span className="hidden sm:inline">التالي</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </span>
      )}
    </nav>
  );
}















