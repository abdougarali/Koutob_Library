"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export function ResendVerificationForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [devVerificationLink, setDevVerificationLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic email validation
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("البريد الإلكتروني غير صحيح");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError(data.error || "تم تجاوز عدد المحاولات المسموح بها");
          toast.error(data.error || "تم تجاوز عدد المحاولات المسموح بها");
        } else {
          setError(data.error || "حدث خطأ أثناء إرسال البريد الإلكتروني");
          toast.error(data.error || "حدث خطأ أثناء إرسال البريد الإلكتروني");
        }
        return;
      }

      // Success
      setIsSubmitted(true);
      
      // Store dev verification link if provided (development mode)
      if (data.devVerificationLink) {
        setDevVerificationLink(data.devVerificationLink);
        console.log("🔗 Development Verification Link:", data.devVerificationLink);
      }
      
      toast.success("تم إرسال رابط التأكيد إلى بريدك الإلكتروني");
    } catch (error) {
      console.error("Resend verification error:", error);
      setError("حدث خطأ غير متوقع");
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
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
        <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
          تم إرسال البريد الإلكتروني
        </h2>
        <p className="text-sm text-[color:var(--color-foreground-muted)]">
          إذا كان البريد الإلكتروني <strong>{email}</strong> مسجلاً لدينا،
          سيتم إرسال رابط التأكيد إليه.
        </p>
        
        {/* Development Mode: Show verification link */}
        {devVerificationLink && (
          <div className="mt-4 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4 text-right">
            <p className="mb-2 text-sm font-semibold text-yellow-800">
              ⚠️ وضع التطوير - رابط التأكيد:
            </p>
            <a
              href={devVerificationLink}
              className="block break-all text-sm text-yellow-700 underline hover:text-yellow-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              {devVerificationLink}
            </a>
            <p className="mt-2 text-xs text-yellow-600">
              (يظهر فقط في وضع التطوير - لا يظهر في الإنتاج)
            </p>
          </div>
        )}
        
        <p className="text-sm text-[color:var(--color-foreground-muted)]">
          يرجى التحقق من صندوق الوارد ورسائل البريد المزعج.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-[color:var(--color-foreground)]"
        >
          البريد الإلكتروني <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-primary)]"
          placeholder="example@email.com"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-[color:var(--color-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "جاري الإرسال..." : "إعادة إرسال رابط التأكيد"}
      </button>
    </form>
  );
}












