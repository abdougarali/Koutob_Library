"use client";

import { FormEvent, useState, useTransition } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    startTransition(async () => {
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.details && Array.isArray(data.details)) {
            // Format validation errors clearly
            const fieldNames: Record<string, string> = {
              name: "الاسم",
              email: "البريد الإلكتروني",
              subject: "الموضوع",
              message: "الرسالة",
            };
            
            const errorMessages = data.details
              .map((d: any) => {
                const fieldPath = d.path?.join(".") || "";
                const fieldName = fieldNames[fieldPath] || fieldPath || "حقل غير معروف";
                return `• ${fieldName}: ${d.message || "قيمة غير صحيحة"}`;
              })
              .join("\n");
            
            toast.error(
              (t) => (
                <div className="text-sm" dir="rtl">
                  <div className="font-semibold mb-2">يرجى تصحيح الأخطاء التالية:</div>
                  <div className="text-xs space-y-1">{errorMessages.split("\n").map((msg: string, i: number) => (
                    <div key={i}>{msg}</div>
                  ))}</div>
                </div>
              ),
              { 
                duration: 7000,
                style: {
                  maxWidth: "500px",
                }
              }
            );
          } else {
            toast.error(
              data.error || "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.",
              { duration: 5000 }
            );
          }
          return;
        }

        // Success
        toast.success(
          data.message || "تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.",
          { 
            duration: 5000,
            icon: "✅",
          }
        );
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } catch (error) {
        console.error("Error submitting contact form:", error);
        toast.error(
          "حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.",
          { duration: 5000 }
        );
      }
    });
  };

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12 sm:gap-8 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-2 sm:gap-3">
        <h1 className="text-2xl font-bold text-[color:var(--color-foreground)] sm:text-3xl">
          تواصل معنا
        </h1>
        <p className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
          نحن هنا للإجابة على استفساراتك ومساعدتك في العثور على الكتب المناسبة.
        </p>
      </header>
      <div className="rounded-2xl border border-[rgba(10,110,92,0.12)] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          <div className="grid gap-1">
            <label className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
              الاسم
            </label>
            <input
              name="name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              minLength={3}
              maxLength={140}
              className="min-h-[48px] rounded-xl border border-[rgba(10,110,92,0.2)] bg-[color:var(--color-surface-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] sm:rounded-2xl sm:px-4 sm:py-3"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
              البريد الإلكتروني
            </label>
            <input
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              maxLength={200}
              className="min-h-[48px] rounded-xl border border-[rgba(10,110,92,0.2)] bg-[color:var(--color-surface-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] sm:rounded-2xl sm:px-4 sm:py-3"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
              الموضوع
            </label>
            <input
              name="subject"
              value={formData.subject || ""}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              minLength={3}
              maxLength={200}
              className="min-h-[48px] rounded-xl border border-[rgba(10,110,92,0.2)] bg-[color:var(--color-surface-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] sm:rounded-2xl sm:px-4 sm:py-3"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
              الرسالة
            </label>
            <textarea
              name="message"
              value={formData.message || ""}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              className="min-h-[120px] rounded-xl border border-[rgba(10,110,92,0.2)] bg-[color:var(--color-surface-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] sm:rounded-2xl sm:px-4 sm:py-3"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="mt-2 min-h-[52px] w-full rounded-full bg-[color:var(--color-primary)] py-3 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition active:opacity-80 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed sm:text-base"
          >
            {isPending ? "جاري الإرسال..." : "إرسال الرسالة"}
          </button>
        </form>
      </div>
      <div className="rounded-2xl border border-[rgba(10,110,92,0.12)] bg-[color:var(--color-surface-muted)] p-4 text-xs sm:rounded-3xl sm:p-6 sm:text-sm">
        <h2 className="mb-2 text-base font-semibold text-[color:var(--color-foreground)] sm:mb-3 sm:text-lg">
          معلومات الاتصال
        </h2>
        <div className="flex flex-col gap-1.5 text-[color:var(--color-foreground-muted)] sm:gap-2">
          <p>البريد الإلكتروني: info@koutob.com</p>
          <p>الهاتف: +216 XX XXX XXX</p>
        </div>
      </div>
    </section>
  );
}


















