"use client";

import { useEffect } from "react";
import Link from "next/link";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function BooksError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Books page error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-6 px-6 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-red-100 p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-12 w-12 text-red-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[color:var(--color-foreground)]">
          حدث خطأ
        </h1>
        <p className="max-w-md text-base text-[color:var(--color-foreground-muted)]">
          {error.message || "حدث خطأ غير متوقع أثناء تحميل الكتب. يرجى المحاولة مرة أخرى."}
        </p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-xl bg-[color:var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          إعادة المحاولة
        </button>
        <Link
          href="/"
          className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-gray-50"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
















