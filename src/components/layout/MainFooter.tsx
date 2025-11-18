import Link from "next/link";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";

export function MainFooter() {
  return (
    <footer className="border-t border-[rgba(184,138,68,0.12)] bg-[color:var(--color-surface-muted)]">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">
              مكتبة كتب
            </h3>
            <p className="text-sm text-[color:var(--color-foreground-muted)]">
              متجر إلكتروني متخصص في الكتب الإسلامية مع خدمة التوصيل المحلي
              والدفع عند الاستلام.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-base font-semibold text-[color:var(--color-foreground)]">
              روابط سريعة
            </h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link
                href="/books"
                className="text-[color:var(--color-foreground-muted)] transition hover:text-[color:var(--color-primary)]"
              >
                جميع الكتب
              </Link>
              <Link
                href="/orders/track"
                className="text-[color:var(--color-foreground-muted)] transition hover:text-[color:var(--color-primary)]"
              >
                تتبع الطلب
              </Link>
              <Link
                href="/contact"
                className="text-[color:var(--color-foreground-muted)] transition hover:text-[color:var(--color-primary)]"
              >
                تواصل معنا
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-base font-semibold text-[color:var(--color-foreground)]">
              معلومات
            </h4>
            <nav className="flex flex-col gap-2 text-sm">
              <span className="text-[color:var(--color-foreground-muted)]">
                الدفع: نقداً عند الاستلام
              </span>
              <span className="text-[color:var(--color-foreground-muted)]">
                التوصيل: عبر شركاء محليين
              </span>
            </nav>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-base font-semibold text-[color:var(--color-foreground)]">
              النشرة الإخبارية
            </h4>
            <NewsletterSignup variant="compact" />
          </div>
        </div>
        <div className="mt-8 border-t border-[rgba(184,138,68,0.12)] pt-6 text-center text-sm text-[color:var(--color-foreground-muted)]">
          <p>© {new Date().getFullYear()} مكتبة كتب. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}





















