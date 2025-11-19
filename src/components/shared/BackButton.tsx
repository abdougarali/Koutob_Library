"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

type BackButtonProps = {
  href?: string;
  label?: string;
  className?: string;
  variant?: "default" | "ghost" | "outline";
  floating?: boolean;
};

export function BackButton({
  href,
  label = "رجوع",
  className = "",
  variant = "default",
  floating = false,
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show on homepage
  if (floating && pathname === "/") {
    return null;
  }

  const baseClasses = floating
    ? "fixed bottom-4 right-4 z-[9999] flex min-h-[40px] min-w-[40px] items-center justify-center gap-1.5 rounded-full bg-[#0a6e5c]/90 px-3.5 py-2 text-xs font-medium text-white shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-[#0a6e5c] hover:shadow-lg active:scale-95 sm:bottom-5 sm:right-5 sm:min-h-[44px] sm:min-w-[44px] sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm md:bottom-6 md:right-6"
    : "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:scale-105 active:scale-95";
  
  const variantClasses = {
    default: floating
      ? "" // Floating button always uses primary green
      : "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary)]/90 shadow-sm",
    ghost: "text-[color:var(--color-foreground-muted)] hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-foreground)]",
    outline: "border border-[color:var(--color-primary)] text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10",
  };

  const buttonContent = (
    <>
      <svg
        className={`rtl:rotate-180 transition-transform duration-200 flex-shrink-0 ${floating ? "h-4 w-4 sm:h-4.5 sm:w-4.5" : "h-4 w-4"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      {floating && (
        <span className="hidden sm:inline text-xs sm:text-sm leading-none">{label}</span>
      )}
      {!floating && <span>{label}</span>}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClasses} ${!floating ? variantClasses[variant] : ""} ${floating ? "group" : ""} ${className}`}
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`${baseClasses} ${!floating ? variantClasses[variant] : ""} ${floating ? "group" : ""} ${className}`}
      aria-label={label}
    >
      {buttonContent}
    </button>
  );
}

