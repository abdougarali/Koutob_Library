"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/stores/cartStore";

export function CartIconLink() {
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link
      href="/cart"
      className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-[color:var(--color-foreground)] transition active:bg-[color:var(--color-surface-muted)] hover:bg-[color:var(--color-surface-muted)]"
      aria-label="سلة المشتريات"
    >
      <svg
        className="h-5 w-5 sm:h-6 sm:w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 min-w-[16px] items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[10px] font-bold text-[color:var(--color-primary-foreground)] sm:-top-1 sm:-right-1 sm:h-5 sm:w-5 sm:text-xs">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}

