import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

export const metadata: Metadata = {
  title: "إعادة تعيين كلمة المرور | مكتبة الفاروق",
  description: "إعادة تعيين كلمة المرور",
};

type ResetPasswordPageProps = {
  params: Promise<{ token: string }>;
};

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const { token } = await params;
  // Decode token in case it's URL encoded
  const decodedToken = decodeURIComponent(token);

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
            إعادة تعيين كلمة المرور
          </h1>
          <p className="mt-2 text-sm text-[color:var(--color-foreground-muted)]">
            أدخل كلمة مرور جديدة لحسابك
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <ResetPasswordForm token={decodedToken} />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-[color:var(--color-foreground-muted)]">
          <Link
            href="/admin/login"
            className="font-medium text-[color:var(--color-primary)] hover:underline"
          >
            العودة إلى تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}

