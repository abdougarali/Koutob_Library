"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function CustomerHeader() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b border-gray-200 bg-white" dir="rtl">
      <div className="mx-auto flex h-auto flex-wrap items-center justify-between gap-3 px-4 py-4 sm:h-20 sm:flex-nowrap sm:gap-6 sm:px-6">
        <Link
          href="/dashboard"
          className="text-lg font-extrabold text-[color:var(--color-primary)] sm:text-2xl"
        >
          لوحة تحكم العميل
        </Link>
        <div className="hidden flex-1 flex-wrap items-center justify-end gap-2 sm:flex sm:gap-3">
          <Link
            href="/"
            className="rounded-xl border border-transparent px-3 py-2 text-xs font-medium text-[color:var(--color-foreground-muted)] transition hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)] sm:text-sm"
          >
            العودة للموقع
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="min-h-[40px] rounded-xl bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 sm:text-sm"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </header>
  );
}

















