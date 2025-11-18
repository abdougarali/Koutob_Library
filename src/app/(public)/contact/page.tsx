import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تواصل معنا | مكتبة كتب الإسلامية",
  description: "تواصل معنا لأي استفسار أو طلب خاص.",
};

export default function ContactPage() {
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
        <form className="flex flex-col gap-3 sm:gap-4">
          <div className="grid gap-1">
            <label className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
              الاسم
            </label>
            <input
              name="name"
              required
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
              required
              className="min-h-[48px] rounded-xl border border-[rgba(10,110,92,0.2)] bg-[color:var(--color-surface-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] sm:rounded-2xl sm:px-4 sm:py-3"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
              الموضوع
            </label>
            <input
              name="subject"
              required
              className="min-h-[48px] rounded-xl border border-[rgba(10,110,92,0.2)] bg-[color:var(--color-surface-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] sm:rounded-2xl sm:px-4 sm:py-3"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
              الرسالة
            </label>
            <textarea
              name="message"
              required
              rows={5}
              className="min-h-[120px] rounded-xl border border-[rgba(10,110,92,0.2)] bg-[color:var(--color-surface-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] sm:rounded-2xl sm:px-4 sm:py-3"
            />
          </div>
          <button
            type="submit"
            className="mt-2 min-h-[52px] w-full rounded-full bg-[color:var(--color-primary)] py-3 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition active:opacity-80 hover:opacity-90 sm:text-base"
          >
            إرسال الرسالة
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


















