"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cartStore";
import toast from "react-hot-toast";

type OrderData = {
  _id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  status: string;
  statusHistory: Array<{
    status: string;
    note?: string;
    updatedAt: string;
  }>;
  items: Array<{
    book?: string | null;
    title: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryFees: number;
  discountCode?: string;
  discountAmount?: number;
  total: number;
  deliveryPartner?: {
    name: string;
    contactName?: string;
    contactPhone?: string;
  } | null;
  createdAt: string;
  confirmedAt?: string;
  deliveredAt?: string;
  notes?: string;
};

type CustomerOrderTrackingClientProps = {
  order: OrderData;
};

const statusLabels: Record<string, string> = {
  "قيد المعالجة": "قيد المعالجة",
  "تم الإرسال": "تم الإرسال",
  "تم التسليم": "تم التسليم",
  "تم الإلغاء": "تم الإلغاء",
};

const statusColors: Record<string, string> = {
  "قيد المعالجة": "bg-blue-100 text-blue-700 border-blue-200",
  "تم الإرسال": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "تم التسليم": "bg-green-100 text-green-700 border-green-200",
  "تم الإلغاء": "bg-red-100 text-red-700 border-red-200",
};

export function CustomerOrderTrackingClient({
  order,
}: CustomerOrderTrackingClientProps) {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addItem);

  const handleQuickReorder = () => {
    try {
      const itemsWithBookId = order.items.filter((item) => Boolean(item.book));

      if (itemsWithBookId.length === 0) {
        toast.error("تعذر إعادة الطلب لأن المنتجات غير مرتبطة بكتب في النظام");
        return;
      }

      itemsWithBookId.forEach((item) => {
        const bookId = item.book as string;
        addToCart(
          {
            id: bookId,
            title: item.title,
            price: item.price,
          },
          item.quantity,
        );
      });

      const skippedCount = order.items.length - itemsWithBookId.length;
      if (skippedCount > 0) {
        toast((t) => (
          <div className="text-sm" dir="rtl">
            {`تمت إضافة ${itemsWithBookId.length} ${itemsWithBookId.length === 1 ? "عنصر" : "عناصر"} إلى السلة`}
            <br />
            {`${skippedCount} ${skippedCount === 1 ? "عنصر" : "عناصر"} لم تعد متاحة`}
          </div>
        ));
      } else {
        toast.success("تمت إضافة جميع عناصر الطلب إلى السلة");
      }
      router.push("/cart");
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error("حدث خطأ أثناء إعادة الطلب");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--color-foreground)] sm:text-3xl">
            تفاصيل الطلب
          </h1>
          <p className="mt-1 text-xs text-[color:var(--color-foreground-muted)] sm:mt-2 sm:text-sm">
            تتبع حالة طلبك وخطوات التوصيل
          </p>
        </div>
        <Link
          href="/dashboard/orders"
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-gray-50"
        >
          ← العودة للطلبات
        </Link>
      </div>

      {/* Order Summary Card */}
      <div className="rounded-2xl border border-[rgba(10,110,92,0.12)] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
              رقم الطلب
            </p>
            <p className="text-xl font-bold text-[color:var(--color-primary)] sm:text-2xl">
              {order.orderCode}
            </p>
          </div>
          <div
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              statusColors[order.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {statusLabels[order.status] || order.status}
          </div>
        </div>

        <div className="grid gap-4 border-t border-[rgba(10,110,92,0.12)] pt-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
              اسم العميل
            </p>
            <p className="text-sm font-medium text-[color:var(--color-foreground)] sm:text-base">
              {order.customerName}
            </p>
          </div>
          <div>
            <p className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
              رقم الهاتف
            </p>
            <p className="text-sm font-medium text-[color:var(--color-foreground)] sm:text-base">
              {order.phone}
            </p>
          </div>
          {order.email && (
            <div>
              <p className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
                البريد الإلكتروني
              </p>
              <p className="text-sm font-medium text-[color:var(--color-foreground)] sm:text-base">
                {order.email}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
              تاريخ الطلب
            </p>
            <p className="text-sm font-medium text-[color:var(--color-foreground)] sm:text-base">
              {new Date(order.createdAt).toLocaleDateString("ar-TN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
              المدينة
            </p>
            <p className="text-sm font-medium text-[color:var(--color-foreground)] sm:text-base">
              {order.city}
            </p>
          </div>
          <div>
            <p className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
              العنوان
            </p>
            <p className="text-sm font-medium text-[color:var(--color-foreground)] sm:text-base">
              {order.address}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-2xl border border-[rgba(10,110,92,0.12)] bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-[color:var(--color-foreground)] sm:text-xl">
          الكتب المطلوبة
        </h2>
        <div className="flex flex-col gap-3">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-xl bg-[color:var(--color-surface-muted)] px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-4"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium text-[color:var(--color-foreground)]">
                  {item.title}
                </span>
                <span className="text-xs text-[color:var(--color-foreground-muted)]">
                  الكمية: {item.quantity} ×{" "}
                  {item.price.toLocaleString("ar-TN", {
                    style: "currency",
                    currency: "TND",
                    maximumFractionDigits: 3,
                  })}
                </span>
              </div>
              <span className="font-semibold text-[color:var(--color-foreground)]">
                {(item.price * item.quantity).toLocaleString("ar-TN", {
                  style: "currency",
                  currency: "TND",
                  maximumFractionDigits: 3,
                })}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2 border-t border-[rgba(10,110,92,0.12)] pt-4 text-sm">
          <div className="flex items-center justify-between text-[color:var(--color-foreground-muted)]">
            <span>قيمة الكتب</span>
            <span>
              {order.subtotal.toLocaleString("ar-TN", {
                style: "currency",
                currency: "TND",
                maximumFractionDigits: 3,
              })}
            </span>
          </div>
          {order.discountAmount && order.discountAmount > 0 && (
            <div className="flex items-center justify-between text-[color:var(--color-accent)]">
              <span>
                خصم{order.discountCode ? ` (${order.discountCode})` : ""}
              </span>
              <span>
                -
                {order.discountAmount.toLocaleString("ar-TN", {
                  style: "currency",
                  currency: "TND",
                  maximumFractionDigits: 3,
                })}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-[color:var(--color-foreground-muted)]">
            <span>رسوم التوصيل</span>
            <span>
              {order.deliveryFees.toLocaleString("ar-TN", {
                style: "currency",
                currency: "TND",
                maximumFractionDigits: 3,
              })}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-dashed border-[rgba(10,110,92,0.2)] pt-3 text-base font-semibold text-[color:var(--color-foreground)] sm:text-lg">
            <span>الإجمالي</span>
            <span>
              {order.total.toLocaleString("ar-TN", {
                style: "currency",
                currency: "TND",
                maximumFractionDigits: 3,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Partner */}
      {order.deliveryPartner && (
        <div className="rounded-2xl border border-[rgba(10,110,92,0.12)] bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-3 text-lg font-semibold text-[color:var(--color-foreground)] sm:text-xl">
            شريك التوصيل
          </h2>
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-medium text-[color:var(--color-foreground)]">
              {order.deliveryPartner.name}
            </p>
            {order.deliveryPartner.contactName && (
              <p className="text-[color:var(--color-foreground-muted)]">
                {order.deliveryPartner.contactName}
              </p>
            )}
            {order.deliveryPartner.contactPhone && (
              <p className="text-[color:var(--color-foreground-muted)]">
                {order.deliveryPartner.contactPhone}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Status History */}
      <div className="rounded-2xl border border-[rgba(10,110,92,0.12)] bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-[color:var(--color-foreground)] sm:text-xl">
          سجل حالة الطلب
        </h2>
        <div className="flex flex-col gap-3">
          {order.statusHistory
            .slice()
            .reverse()
            .map((entry, index) => (
              <div
                key={index}
                className="flex items-start gap-4 border-r-4 border-[rgba(10,110,92,0.2)] pr-4"
              >
                <div className="flex flex-1 flex-col gap-1">
                  <p className="font-medium text-[color:var(--color-foreground)]">
                    {statusLabels[entry.status] || entry.status}
                  </p>
                  {entry.note && (
                    <p className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
                      {entry.note}
                    </p>
                  )}
                  <p className="text-xs text-[color:var(--color-foreground-muted)]">
                    {new Date(entry.updatedAt).toLocaleString("ar-TN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="rounded-2xl border border-[rgba(10,110,92,0.12)] bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-3 text-lg font-semibold text-[color:var(--color-foreground)] sm:text-xl">
            ملاحظات الطلب
          </h2>
          <p className="text-sm text-[color:var(--color-foreground-muted)] sm:text-base">
            {order.notes}
          </p>
        </div>
      )}

      {/* Actions */}
      {order.status === "تم التسليم" && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleQuickReorder}
            className="rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 sm:text-base"
          >
            إعادة الطلب
          </button>
        </div>
      )}
    </div>
  );
}





