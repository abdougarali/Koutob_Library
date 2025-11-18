import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "نسيت كلمة المرور | مكتبة كتب الإسلامية",
  description: "إعادة تعيين كلمة المرور",
};

export default function ForgotPasswordPage() {
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
            نسيت كلمة المرور؟
          </h1>
          <p className="mt-2 text-sm text-[color:var(--color-foreground-muted)]">
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <ForgotPasswordForm />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-[color:var(--color-foreground-muted)]">
          تذكرت كلمة المرور؟{" "}
          <Link
            href="/admin/login"
            className="font-medium text-[color:var(--color-primary)] hover:underline"
          >
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}








