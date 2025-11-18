"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ResendVerificationForm } from "@/components/forms/ResendVerificationForm";

export default function ResendVerificationPage() {
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
            إعادة إرسال رابط التأكيد
          </h1>
          <p className="mt-2 text-sm text-[color:var(--color-foreground-muted)]">
            أدخل بريدك الإلكتروني لإعادة إرسال رابط التأكيد
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <ResendVerificationForm />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[color:var(--color-foreground-muted)]">
          <Link
            href="/admin/login"
            className="text-[color:var(--color-primary)] hover:underline"
          >
            العودة إلى تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}






