import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "سلة المشتريات | مكتبة الفاروق",
  description: "راجع مشترياتك وأكمل عملية الشراء.",
};

export default function CartPage() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12 sm:gap-8 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-2 sm:gap-3">
        <h1 className="text-2xl font-bold text-[color:var(--color-foreground)] sm:text-3xl">
          سلة المشتريات
        </h1>
        <p className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
          راجع مشترياتك وأكمل عملية الشراء.
        </p>
      </header>
      <CartView initialItems={[]} />
    </section>
  );
}


















