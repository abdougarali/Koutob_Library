"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/stores/cartStore";

export function BookPageCart() {
  const { items, updateQuantity, removeItem } = useCartStore();

  if (items.length === 0) return null;

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingFees = 25;
  const total = subtotal + shippingFees;

  return (
    <div className="mt-8 rounded-3xl bg-gray-100 p-6 shadow-inner">
      <h2 className="mb-4 text-xl font-bold text-[color:var(--color-foreground)]">
        سلة المشتريات
      </h2>

      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const itemTotal = item.price * item.quantity;
          return (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[color:var(--color-surface-muted)]">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized={item.imageUrl.includes("via.placeholder.com")}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl">
                    📚
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[color:var(--color-foreground)] line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 text-[color:var(--color-foreground-muted)] transition hover:text-red-600"
                    aria-label="حذف"
                  >
                    <svg
                      className="h-5 w-5"
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
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          Math.max(1, item.quantity - 1),
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-medium text-[color:var(--color-foreground)] transition hover:bg-gray-50"
                      aria-label="تقليل الكمية"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-xs font-medium text-[color:var(--color-foreground)]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-medium text-[color:var(--color-foreground)] transition hover:bg-gray-50"
                      aria-label="زيادة الكمية"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-bold text-[color:var(--color-foreground)]">
                    {itemTotal.toLocaleString("ar-TN", {
                      style: "currency",
                      currency: "TND",
                      maximumFractionDigits: 3,
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-gray-300 pt-4">
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[color:var(--color-foreground-muted)]">
              المجموع الفرعي
            </span>
            <span className="font-medium text-[color:var(--color-foreground)]">
              {subtotal.toLocaleString("ar-TN", {
                style: "currency",
                currency: "TND",
                maximumFractionDigits: 3,
              })}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[color:var(--color-foreground-muted)]">
              رسوم التوصيل
            </span>
            <span className="font-medium text-[color:var(--color-foreground)]">
              {shippingFees.toLocaleString("ar-TN", {
                style: "currency",
                currency: "TND",
                maximumFractionDigits: 3,
              })}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-300 pt-2">
            <span className="font-semibold text-[color:var(--color-foreground)]">
              الإجمالي
            </span>
            <span className="text-lg font-bold text-[color:var(--color-primary)]">
              {total.toLocaleString("ar-TN", {
                style: "currency",
                currency: "TND",
                maximumFractionDigits: 3,
              })}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/cart"
            className="rounded-full bg-[color:var(--color-primary)] px-6 py-3 text-center text-sm font-semibold text-[color:var(--color-primary-foreground)] transition hover:opacity-90"
          >
            عرض السلة الكاملة
          </Link>
          <Link
            href="/checkout"
            className="rounded-full border-2 border-[color:var(--color-primary)] bg-white px-6 py-3 text-center text-sm font-semibold text-[color:var(--color-primary)] transition hover:bg-gray-50"
          >
            إتمام الطلب
          </Link>
        </div>
      </div>
    </div>
  );
}

