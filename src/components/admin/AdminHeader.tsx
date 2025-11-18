"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AdminHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">
          لوحة الإدارة
        </h1>
        <button
          onClick={handleLogout}
          className="hidden rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:block"
        >
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
}


















