"use client";

import Link from "next/link";

export function VerifyEmailContent() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="mb-4 inline-block text-2xl font-bold text-[color:var(--color-primary)]"
          >
            مكتبة كتب الإسلامية
          </Link>
          <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">
            تأكيد البريد الإلكتروني
          </h1>
        </div>

        {/* Content Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h2 className="mb-4 text-xl font-semibold text-[color:var(--color-foreground)]">
            تحقق من بريدك الإلكتروني
          </h2>

          <p className="mb-6 text-sm text-[color:var(--color-foreground-muted)]">
            تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى النقر على الرابط في البريد الإلكتروني لتأكيد حسابك.
          </p>

          <div className="rounded-lg bg-blue-50 p-4 text-right">
            <p className="mb-2 text-sm font-semibold text-blue-800">
              لم تستلم البريد الإلكتروني؟
            </p>
            <p className="mb-4 text-xs text-blue-600">
              تحقق من مجلد الرسائل المزعج أو انتظر بضع دقائق
            </p>
            <Link
              href="/resend-verification"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              إعادة إرسال رابط التأكيد
            </Link>
          </div>

          <div className="mt-6">
            <Link
              href="/admin/login"
              className="text-sm font-medium text-[color:var(--color-primary)] hover:underline"
            >
              العودة إلى تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

