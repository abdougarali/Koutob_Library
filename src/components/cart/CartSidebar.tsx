"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cartStore";

type CartSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingFees = items.length > 0 ? 25 : 0;
  const total = subtotal + shippingFees;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      {/* Sidebar */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-gray-100 shadow-2xl transition-transform duration-300 ease-in-out lg:max-w-lg" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-300 bg-white px-6 py-4">
          <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">
            سلة المشتريات
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--color-foreground-muted)] transition hover:bg-gray-200 hover:text-[color:var(--color-foreground)]"
            aria-label="إغلاق السلة"
          >
            <svg
              className="h-6 w-6"
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

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <svg
                className="h-24 w-24 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="text-lg font-medium text-[color:var(--color-foreground-muted)]">
                سلة المشتريات فارغة
              </p>
              <p className="text-sm text-[color:var(--color-foreground-muted)]">
                ابدأ بإضافة الكتب إلى سلة المشتريات
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => {
                const itemTotal = item.price * item.quantity;
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm"
                  >
                    <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[color:var(--color-surface-muted)]">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                          unoptimized={item.imageUrl.includes("via.placeholder.com")}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">
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
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-sm font-medium text-[color:var(--color-foreground)] transition hover:bg-gray-50"
                            aria-label="تقليل الكمية"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-[color:var(--color-foreground)]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-sm font-medium text-[color:var(--color-foreground)] transition hover:bg-gray-50"
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
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-300 bg-white px-6 py-4">
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
                onClick={onClose}
                className="rounded-full bg-[color:var(--color-primary)] px-6 py-3 text-center text-sm font-semibold text-[color:var(--color-primary-foreground)] transition hover:opacity-90"
              >
                عرض السلة الكاملة
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="rounded-full border-2 border-[color:var(--color-primary)] bg-white px-6 py-3 text-center text-sm font-semibold text-[color:var(--color-primary)] transition hover:bg-gray-50"
              >
                إتمام الطلب
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

