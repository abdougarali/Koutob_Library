"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailTokenPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = params?.token as string;

      if (!token) {
        setStatus("error");
        setMessage("رمز التحقق غير صحيح");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email/${token}`, {
          method: "GET",
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "تم تأكيد البريد الإلكتروني بنجاح");
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/admin/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "فشل في تأكيد البريد الإلكتروني");
        }
      } catch (error) {
        console.error("Error verifying email:", error);
        setStatus("error");
        setMessage("حدث خطأ أثناء تأكيد البريد الإلكتروني");
      }
    };

    verifyEmail();
  }, [params, router]);

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
          {status === "loading" && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="h-8 w-8 animate-spin text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <p className="text-sm text-[color:var(--color-foreground-muted)]">
                جاري التحقق من البريد الإلكتروني...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mb-4 text-xl font-semibold text-[color:var(--color-foreground)]">
                تم التأكيد بنجاح!
              </h2>
              <p className="mb-6 text-sm text-[color:var(--color-foreground-muted)]">
                {message}
              </p>
              <p className="text-xs text-[color:var(--color-foreground-muted)]">
                سيتم توجيهك إلى صفحة تسجيل الدخول...
              </p>
              <Link
                href="/admin/login"
                className="mt-4 inline-block text-sm font-medium text-[color:var(--color-primary)] hover:underline"
              >
                الانتقال الآن
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mb-4 text-xl font-semibold text-[color:var(--color-foreground)]">
                فشل التأكيد
              </h2>
              <p className="mb-6 text-sm text-[color:var(--color-foreground-muted)]">
                {message}
              </p>
              <div className="space-y-2">
                <Link
                  href="/resend-verification"
                  className="block text-sm font-medium text-[color:var(--color-primary)] hover:underline"
                >
                  إعادة إرسال رابط التأكيد
                </Link>
                <Link
                  href="/admin/login"
                  className="block text-sm text-[color:var(--color-foreground-muted)] hover:underline"
                >
                  العودة إلى تسجيل الدخول
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}






