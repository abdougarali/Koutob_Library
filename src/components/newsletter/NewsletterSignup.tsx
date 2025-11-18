"use client";

import { useState, FormEvent } from "react";
import toast from "react-hot-toast";

type NewsletterSignupProps = {
  className?: string;
  showName?: boolean;
  variant?: "default" | "compact";
};

export function NewsletterSignup({
  className = "",
  showName = false,
  variant = "default",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }

    // Basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("البريد الإلكتروني غير صحيح");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          ...(showName && name.trim() && { name: name.trim() }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "تم الاشتراك بنجاح!");
        setEmail("");
        setName("");
      } else {
        toast.error(data.error || "حدث خطأ أثناء الاشتراك");
      }
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      toast.error("حدث خطأ أثناء الاشتراك. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === "compact") {
    return (
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-2 sm:flex-row ${className}`}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="البريد الإلكتروني"
          required
          disabled={isSubmitting}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "جاري..." : "اشتراك"}
        </button>
      </form>
    );
  }

  return (
    <div className={`rounded-2xl border border-[rgba(10,110,92,0.12)] bg-white p-4 shadow-sm sm:p-6 ${className}`}>
      <h3 className="mb-2 text-lg font-semibold text-[color:var(--color-foreground)] sm:text-xl">
        اشترك في نشرتنا الإخبارية
      </h3>
      <p className="mb-4 text-sm text-[color:var(--color-foreground-muted)]">
        احصل على آخر الأخبار عن الكتب الجديدة والعروض الخاصة
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        {showName && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="الاسم (اختياري)"
            maxLength={140}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 disabled:bg-gray-50"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="البريد الإلكتروني"
          required
          disabled={isSubmitting}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[color:var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "جاري الاشتراك..." : "اشترك الآن"}
        </button>
      </form>
    </div>
  );
}





