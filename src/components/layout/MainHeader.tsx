"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CartIconLink } from "./header/CartIconLink";
import { LoginIconLink } from "./header/LoginIconLink";

export function MainHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuRef.current &&
        menuButtonRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(184,138,68,0.12)] bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Mobile: Icons on left */}
        <div className="flex items-center gap-2 sm:hidden">
          <LoginIconLink />
          <CartIconLink />
        </div>
        {/* Logo - centered on mobile, left on desktop */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-[color:var(--color-primary)] transition hover:opacity-80 sm:text-xl lg:text-2xl"
        >
          <svg
            className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-[color:var(--color-primary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="hidden sm:inline">مكتبة الفاروق</span>
          <span className="sm:hidden">مكتبة الفاروق</span>
        </Link>
        {/* Desktop: Navigation in center, Icons on right */}
        <nav className="hidden items-center gap-4 md:gap-6 lg:flex">
          <Link
            href="/"
            className="text-xs font-medium text-[color:var(--color-foreground)] transition hover:text-[color:var(--color-primary)] sm:text-sm"
          >
            الرئيسية
          </Link>
          <Link
            href="/books"
            className="text-xs font-medium text-[color:var(--color-foreground)] transition hover:text-[color:var(--color-primary)] sm:text-sm"
          >
            الكتب
          </Link>
          <Link
            href="/orders/track"
            className="text-xs font-medium text-[color:var(--color-foreground)] transition hover:text-[color:var(--color-primary)] sm:text-sm"
          >
            تتبع الطلب
          </Link>
          <Link
            href="/contact"
            className="text-xs font-medium text-[color:var(--color-foreground)] transition hover:text-[color:var(--color-primary)] sm:text-sm"
          >
            تواصل معنا
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop: Icons on right */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-4">
            <LoginIconLink />
            <CartIconLink />
          </div>
          {/* Mobile: Menu button on right */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-surface-muted)] md:hidden"
            aria-label="القائمة"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="border-t border-[rgba(184,138,68,0.12)] bg-white md:hidden">
          <nav className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-4">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-primary)]"
            >
              الرئيسية
            </Link>
            <Link
              href="/books"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-primary)]"
            >
              الكتب
            </Link>
            <Link
              href="/orders/track"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-primary)]"
            >
              تتبع الطلب
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-primary)]"
            >
              تواصل معنا
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
