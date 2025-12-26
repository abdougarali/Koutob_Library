import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/forms/SignupForm";

export const metadata: Metadata = {
  title: "إنشاء حساب جديد | مكتبة الفاروق",
  description: "أنشئ حساباً جديداً للوصول إلى جميع خدماتنا",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="mb-4 inline-block text-2xl font-bold text-[color:var(--color-primary)]"
          >
            مكتبة الفاروق
          </Link>
          <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">
            إنشاء حساب جديد
          </h1>
          <p className="mt-2 text-sm text-[color:var(--color-foreground-muted)]">
            انضم إلينا للوصول إلى جميع خدماتنا
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <SignupForm />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[color:var(--color-foreground-muted)]">
          بإنشاء حساب، أنت توافق على{" "}
          <Link
            href="/terms"
            className="text-[color:var(--color-primary)] hover:underline"
          >
            الشروط والأحكام
          </Link>{" "}
          و{" "}
          <Link
            href="/privacy"
            className="text-[color:var(--color-primary)] hover:underline"
          >
            سياسة الخصوصية
          </Link>
        </p>
      </div>
    </div>
  );
}








