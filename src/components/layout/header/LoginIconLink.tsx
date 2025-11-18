"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export function LoginIconLink() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculate dropdown position on mobile to prevent overflow
  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // On mobile, ensure dropdown doesn't overflow
      if (viewportWidth < 640) {
        const dropdownWidth = 280;
        const rightEdge = viewportWidth - rect.right;
        const leftEdge = rect.left;
        
        // If dropdown would overflow on the left, adjust position
        if (leftEdge < dropdownWidth) {
          setDropdownStyle({
            right: `${Math.max(0, rightEdge)}px`,
            maxWidth: `${Math.min(dropdownWidth, viewportWidth - 16)}px`,
          });
        } else {
          setDropdownStyle({
            right: '0',
            maxWidth: `${Math.min(dropdownWidth, viewportWidth - 16)}px`,
          });
        }
      } else {
        setDropdownStyle({});
      }
    }
  }, [isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
    setIsDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (!session?.user) return "/admin/login";
    return session.user.role === "admin" ? "/admin" : "/dashboard";
  };

  // Show loading state
  if (status === "loading") {
    return (
      <div className="relative">
        <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
      </div>
    );
  }

  // Not logged in - show login and signup buttons
  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/signup"
          className="rounded-lg bg-[color:var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:var(--color-primary)]/90"
          aria-label="إنشاء حساب"
        >
          إنشاء حساب
        </Link>
        <Link
          href="/admin/login"
          className="relative flex items-center justify-center rounded-lg p-2 text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-surface-muted)]"
          aria-label="تسجيل الدخول"
        >
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
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
        </Link>
      </div>
    );
  }

  // Logged in - show user menu
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative flex items-center justify-center rounded-lg p-2 text-[color:var(--color-foreground)] transition active:bg-[color:var(--color-surface-muted)] hover:bg-[color:var(--color-surface-muted)]"
        aria-label="حسابي"
        aria-expanded={isDropdownOpen}
      >
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div 
          className="absolute right-0 top-full z-50 mt-0.5 w-[280px] max-w-[calc(100vw-1rem)] rounded-md border border-gray-200 bg-white shadow-xl sm:mt-2 sm:w-full sm:min-w-[200px] sm:max-w-none sm:rounded-lg" 
          dir="rtl" 
          style={dropdownStyle}
        >
          <div className="p-1.5 sm:p-2">
            <div className="border-b border-gray-100 px-2.5 py-2 sm:px-3 sm:py-2.5">
              <p className="text-xs font-semibold leading-tight text-[color:var(--color-foreground)] sm:text-sm sm:leading-normal">
                {session.user.name}
              </p>
              <p className="mt-1 text-[10px] leading-tight text-[color:var(--color-foreground-muted)] break-all sm:mt-1 sm:text-xs sm:leading-normal">
                {session.user.email}
              </p>
              <span className="mt-1.5 inline-block rounded-full bg-blue-100 px-2 py-1 text-[10px] font-medium text-blue-700 sm:mt-2 sm:px-2.5 sm:py-0.5 sm:text-xs">
                {session.user.role === "admin" ? "مشرف" : "عميل"}
              </span>
            </div>
            <div className="py-1 sm:py-1.5">
              <Link
                href={getDashboardLink()}
                onClick={() => setIsDropdownOpen(false)}
                className="flex min-h-[44px] items-center px-2.5 py-2.5 text-xs font-medium text-[color:var(--color-foreground)] transition active:bg-gray-100 hover:bg-gray-50 sm:px-3 sm:py-2 sm:text-sm"
              >
                {session.user.role === "admin" ? "لوحة الإدارة" : "لوحة التحكم"}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex min-h-[44px] w-full items-center px-2.5 py-2.5 text-right text-xs font-medium text-red-600 transition active:bg-red-100 hover:bg-red-50 sm:px-3 sm:py-2 sm:text-sm"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}










