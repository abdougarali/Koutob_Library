"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomSelect } from "./CustomSelect";

type AdvancedFiltersProps = {
  basePath?: string;
  initialFilters?: {
    minPrice?: string;
    maxPrice?: string;
    format?: string;
    sort?: string;
    author?: string;
  };
};

export function AdvancedFilters({
  basePath = "/books",
  initialFilters = {},
}: AdvancedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState({
    minPrice: initialFilters.minPrice || "",
    maxPrice: initialFilters.maxPrice || "",
    format: initialFilters.format || "",
    sort: initialFilters.sort || "newest",
    author: initialFilters.author || "",
  });

  // Sync with URL params on mount
  useEffect(() => {
    const urlMinPrice = searchParams.get("minPrice");
    const urlMaxPrice = searchParams.get("maxPrice");
    const urlFormat = searchParams.get("format");
    const urlSort = searchParams.get("sort");
    const urlAuthor = searchParams.get("author");

    setFilters({
      minPrice: urlMinPrice || "",
      maxPrice: urlMaxPrice || "",
      format: urlFormat || "",
      sort: urlSort || "newest",
      author: urlAuthor || "",
    });

    // Auto-expand if any filters are active
    if (urlMinPrice || urlMaxPrice || urlFormat || (urlSort && urlSort !== "newest") || urlAuthor) {
      setIsExpanded(true);
    }
  }, [searchParams]);

  const hasActiveFilters =
    filters.minPrice ||
    filters.maxPrice ||
    filters.format ||
    filters.sort !== "newest" ||
    filters.author;

  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      // Price filters
      if (filters.minPrice) {
        params.set("minPrice", filters.minPrice);
      } else {
        params.delete("minPrice");
      }

      if (filters.maxPrice) {
        params.set("maxPrice", filters.maxPrice);
      } else {
        params.delete("maxPrice");
      }

      // Format filter
      if (filters.format) {
        params.set("format", filters.format);
      } else {
        params.delete("format");
      }

      // Sort
      if (filters.sort && filters.sort !== "newest") {
        params.set("sort", filters.sort);
      } else {
        params.delete("sort");
      }

      // Author
      if (filters.author) {
        params.set("author", filters.author);
      } else {
        params.delete("author");
      }

      // Reset to page 1 when filters change
      params.delete("page");

      router.push(`${basePath}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      format: "",
      sort: "newest",
      author: "",
    });

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("minPrice");
      params.delete("maxPrice");
      params.delete("format");
      params.delete("sort");
      params.delete("author");
      params.delete("page");

      router.push(`${basePath}?${params.toString()}`);
    });
  };

  const removeFilter = (filterName: string) => {
    const newFilters = { ...filters };
    switch (filterName) {
      case "minPrice":
        newFilters.minPrice = "";
        break;
      case "maxPrice":
        newFilters.maxPrice = "";
        break;
      case "format":
        newFilters.format = "";
        break;
      case "sort":
        newFilters.sort = "newest";
        break;
      case "author":
        newFilters.author = "";
        break;
    }
    setFilters(newFilters);

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(filterName);
      params.delete("page");

      router.push(`${basePath}?${params.toString()}`);
    });
  };

  const removePriceFilter = () => {
    setFilters({ ...filters, minPrice: "", maxPrice: "" });

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("minPrice");
      params.delete("maxPrice");
      params.delete("page");

      router.push(`${basePath}?${params.toString()}`);
    });
  };

  const getActiveFilterLabels = () => {
    const labels: Array<{ key: string; label: string }> = [];
    if (filters.minPrice || filters.maxPrice) {
      const priceLabel = filters.minPrice && filters.maxPrice
        ? `${filters.minPrice} - ${filters.maxPrice} د.ت`
        : filters.minPrice
          ? `من ${filters.minPrice} د.ت`
          : `إلى ${filters.maxPrice} د.ت`;
      labels.push({ key: "price", label: `السعر: ${priceLabel}` });
    }
    if (filters.format) {
      labels.push({
        key: "format",
        label: `النوع: ${filters.format === "hardcover" ? "غلاف مقوى" : "غلاف عادي"}`,
      });
    }
    if (filters.sort && filters.sort !== "newest") {
      const sortLabels: Record<string, string> = {
        oldest: "الأقدم",
        "price-low": "السعر: من الأقل",
        "price-high": "السعر: من الأعلى",
        "title-asc": "الاسم: أ-ي",
        "title-desc": "الاسم: ي-أ",
      };
      labels.push({ key: "sort", label: `الترتيب: ${sortLabels[filters.sort] || filters.sort}` });
    }
    if (filters.author) {
      labels.push({ key: "author", label: `المؤلف: ${filters.author}` });
    }
    return labels;
  };

  const activeFilterLabels = getActiveFilterLabels();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-semibold text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)]"
        >
          <span>فلترة متقدمة</span>
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-xs font-bold text-white">
              {activeFilterLabels.length}
            </span>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-[color:var(--color-primary)] hover:underline"
          >
            مسح الكل
          </button>
        )}
      </div>

      {/* Active Filters Tags */}
      {hasActiveFilters && activeFilterLabels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeFilterLabels.map((filter) => (
            <span
              key={filter.key}
              className="flex items-center gap-1 rounded-full bg-[color:var(--color-primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--color-primary)]"
            >
              {filter.label}
              <button
                type="button"
                onClick={() => {
                  if (filter.key === "price") {
                    removePriceFilter();
                  } else {
                    removeFilter(filter.key);
                  }
                }}
                className="ml-1 hover:text-[color:var(--color-primary)]/70"
                aria-label="إزالة الفلتر"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
          {/* Price Range */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-foreground)] sm:mb-2 sm:text-sm">
              نطاق السعر (د.ت)
            </label>
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                type="number"
                min="0"
                step="0.1"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({ ...filters, minPrice: e.target.value })
                }
                placeholder="من"
                className="min-h-[44px] w-full rounded-lg border border-gray-300 px-2.5 py-2 text-xs text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 sm:px-3 sm:text-sm"
              />
              <span className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">-</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: e.target.value })
                }
                placeholder="إلى"
                className="min-h-[44px] w-full rounded-lg border border-gray-300 px-2.5 py-2 text-xs text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 sm:px-3 sm:text-sm"
              />
            </div>
          </div>

          {/* Format & Sort Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Format */}
            <CustomSelect
              label="نوع الغلاف"
              value={filters.format}
              onChange={(value) => setFilters({ ...filters, format: value })}
              options={[
                { value: "", label: "الكل" },
                { value: "hardcover", label: "غلاف مقوى" },
                { value: "paperback", label: "غلاف عادي" },
              ]}
              placeholder="اختر نوع الغلاف"
            />

            {/* Sort */}
            <CustomSelect
              label="ترتيب حسب"
              value={filters.sort}
              onChange={(value) => setFilters({ ...filters, sort: value })}
              options={[
                { value: "newest", label: "الأحدث" },
                { value: "oldest", label: "الأقدم" },
                { value: "price-low", label: "السعر: من الأقل للأعلى" },
                { value: "price-high", label: "السعر: من الأعلى للأقل" },
                { value: "title-asc", label: "الاسم: أ-ي" },
                { value: "title-desc", label: "الاسم: ي-أ" },
              ]}
              placeholder="اختر الترتيب"
            />
          </div>

          {/* Author */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-foreground)] sm:mb-2 sm:text-sm">
              المؤلف
            </label>
            <input
              type="text"
              value={filters.author}
              onChange={(e) => setFilters({ ...filters, author: e.target.value })}
              placeholder="ابحث عن مؤلف..."
              className="min-h-[44px] w-full rounded-lg border border-gray-300 px-2.5 py-2 text-xs text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 sm:px-3 sm:text-sm"
            />
          </div>

          {/* Apply Button */}
          <button
            type="button"
            onClick={applyFilters}
            disabled={isPending}
            className="min-h-[48px] w-full rounded-lg bg-[color:var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-white transition active:opacity-80 hover:opacity-90 disabled:opacity-50 sm:py-2 sm:text-sm"
          >
            {isPending ? "جاري التطبيق..." : "تطبيق الفلاتر"}
          </button>
        </div>
      )}
    </div>
  );
}

