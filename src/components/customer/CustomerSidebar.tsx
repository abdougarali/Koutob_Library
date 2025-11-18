"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "الرئيسية", icon: "🏠" },
  { href: "/dashboard/orders", label: "طلباتي", icon: "📦" },
  { href: "/wishlist", label: "قائمة الأمنيات", icon: "❤️" },
  { href: "/dashboard/profile", label: "ملفي الشخصي", icon: "👤" },
];

export function CustomerSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleClose = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen((prev) => !prev)}
        className="fixed top-20 left-3 z-40 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-[color:var(--color-primary)] p-2 text-white shadow-lg transition active:scale-95 hover:bg-[color:var(--color-primary)]/90 lg:hidden"
        aria-label="القائمة الجانبية"
        aria-expanded={isMobileOpen}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={
              isMobileOpen
                ? "M6 18L18 6M6 6l12 12"
                : "M4 6h16M4 12h16M4 18h16"
            }
          />
        </svg>
      </button>

      <aside
        className={`fixed right-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-l border-gray-200 bg-gray-50 px-5 py-4 shadow-xl transition-transform duration-300 lg:relative lg:top-0 lg:h-auto lg:translate-x-0 lg:border-none lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none ${
          isMobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
        dir="rtl"
      >
        <nav className="mt-8 flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 lg:border-none lg:bg-transparent lg:p-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[color:var(--color-primary)] text-white"
                    : "text-[color:var(--color-foreground-muted)] hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={handleClose}
        />
      )}
    </>
  );
}














