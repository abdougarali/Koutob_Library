"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/admin", label: "لوحة التحكم", icon: "📊" },
  { href: "/admin/books", label: "الكتب", icon: "📚" },
  { href: "/admin/orders", label: "الطلبات", icon: "📦" },
  { href: "/admin/discounts", label: "رموز الخصم", icon: "🎟️" },
  { href: "/admin/reviews", label: "التقييمات", icon: "⭐" },
  { href: "/admin/delivery", label: "شركاء التوصيل", icon: "🚚" },
  { href: "/admin/users", label: "المستخدمون", icon: "👥" },
  { href: "/admin/newsletter", label: "النشرة الإخبارية", icon: "📧" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-20 left-2 z-40 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-[color:var(--color-primary)] p-2.5 text-white shadow-lg transition active:scale-95 hover:bg-[color:var(--color-primary)]/90 sm:left-4 sm:min-h-[48px] sm:min-w-[48px] lg:hidden"
        aria-label="القائمة"
        aria-expanded={isMobileOpen}
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
            d={isMobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-l border-gray-200 bg-gray-50 p-4 transition-transform lg:relative lg:top-0 lg:z-auto lg:h-auto lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition sm:px-4 sm:py-3 sm:text-sm ${
                  isActive
                    ? "bg-[color:var(--color-primary)] text-white"
                    : "text-[color:var(--color-foreground-muted)] hover:bg-gray-100"
                }`}
              >
                <span className="text-base sm:text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
















