"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type FilterBarProps = {
  categories: string[];
  selectedCategory?: string;
  basePath?: string;
};

export function FilterBar({
  categories,
  selectedCategory,
  basePath = "/books",
}: FilterBarProps) {
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      <Link
        href={basePath}
        className={`min-h-[40px] rounded-full px-3 py-1.5 text-xs font-semibold transition active:opacity-80 sm:px-4 sm:py-2 sm:text-sm ${
          !selectedCategory
            ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
            : "border border-[rgba(10,110,92,0.2)] bg-white text-[color:var(--color-primary)] active:border-[color:var(--color-primary)] hover:border-[color:var(--color-primary)]"
        }`}
      >
        الكل
      </Link>
      {categories.map((category) => (
        <Link
          key={category}
          href={`${basePath}?category=${encodeURIComponent(category)}`}
          className={`min-h-[40px] rounded-full px-3 py-1.5 text-xs font-semibold transition active:opacity-80 sm:px-4 sm:py-2 sm:text-sm ${
            selectedCategory === category
              ? "bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
              : "border border-[rgba(10,110,92,0.2)] bg-white text-[color:var(--color-primary)] active:border-[color:var(--color-primary)] hover:border-[color:var(--color-primary)]"
          }`}
        >
          {category}
        </Link>
      ))}
    </div>
  );
}


















