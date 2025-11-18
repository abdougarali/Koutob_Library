"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type OrderConfirmationClientProps = {
  initialCode?: string;
};

export default function OrderConfirmationClient({
  initialCode,
}: OrderConfirmationClientProps) {
  const [orderCode] = useState(initialCode || "");

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
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
        <h1 className="text-3xl font-bold text-[color:var(--color-foreground)]">
          تم إتمام الطلب بنجاح!
        </h1>
        <p className="text-sm text-[color:var(--color-foreground-muted)]">
          شكراً لك على طلبك. سيتم التواصل معك قريباً لتأكيد عملية التوصيل.
        </p>
      </header>

      <div className="rounded-3xl border border-[rgba(10,110,92,0.12)] bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <p className="text-sm text-[color:var(--color-foreground-muted)]">
              رقم الطلب
            </p>
            <p className="mt-2 text-3xl font-bold text-[color:var(--color-primary)]">
              {orderCode || "غير متوفر"}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-sm text-[color:var(--color-foreground-muted)]">
            <p>• سيتم التواصل معك عبر الهاتف لتأكيد الطلب</p>
            <p>• الدفع يتم نقداً عند الاستلام</p>
            <p>• يمكنك تتبع حالة الطلب باستخدام رقم الطلب أعلاه</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {orderCode && (
          <Link
            href={`/orders/track?code=${encodeURIComponent(orderCode)}`}
            className="rounded-full bg-[color:var(--color-primary)] px-6 py-3 text-center text-base font-semibold text-white transition hover:opacity-90"
          >
            تتبع الطلب الآن
          </Link>
        )}
        <Link
          href="/orders/track"
          className={`rounded-full ${
            orderCode
              ? "border border-[color:var(--color-primary)] bg-white text-[color:var(--color-primary)] hover:bg-gray-50"
              : "bg-[color:var(--color-primary)] text-white hover:opacity-90"
          } px-6 py-3 text-center text-base font-semibold transition`}
        >
          {orderCode ? "تتبع طلب آخر" : "تتبع الطلب"}
        </Link>
        <Link
          href="/books"
          className="rounded-full border border-[color:var(--color-primary)] bg-white px-6 py-3 text-center text-base font-semibold text-[color:var(--color-primary)] transition hover:bg-gray-50"
        >
          تصفح المزيد من الكتب
        </Link>
      </div>
    </div>
  );
}

