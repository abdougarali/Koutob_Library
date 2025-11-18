"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";

type OrderTrackClientProps = {
  initialCode?: string;
};

type OrderData = {
  orderCode: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  status: string;
  statusHistory: Array<{
    status: string;
    note?: string;
    updatedAt: string;
  }>;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryFees: number;
  total: number;
  deliveryPartner?: {
    name: string;
    contactName?: string;
    contactPhone?: string;
  } | null;
  createdAt: string;
  confirmedAt?: string;
  deliveredAt?: string;
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

type TrackMode = "code" | "phone";

export function OrderTrackClient({ initialCode }: OrderTrackClientProps) {
  const [trackMode, setTrackMode] = useState<TrackMode>("code");
  const [orderCode, setOrderCode] = useState(initialCode || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [selectedOrderCode, setSelectedOrderCode] = useState<string | null>(
    initialCode || null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();

  const selectedOrder = useMemo(() => {
    if (!selectedOrderCode) return null;
    return orders.find((item) => item.orderCode === selectedOrderCode) ?? null;
  }, [orders, selectedOrderCode]);

  const resetState = () => {
    setOrders([]);
    setSelectedOrderCode(null);
  };

  useEffect(() => {
    if (initialCode && initialCode.trim()) {
      setTrackMode("code");
      const code = initialCode.trim();
      setError(null);
      setOrders([]);
      setSelectedOrderCode(null);
      fetchOrders("code", code);
    }
  }, [initialCode]);

  const fetchOrders = (mode: TrackMode, value: string) => {
    const trimmed = value.trim();

    if (mode === "code" && !trimmed) {
      setError("يرجى إدخال رقم الطلب.");
      return;
    }
    if (mode === "phone" && !trimmed) {
      setError("يرجى إدخال رقم الهاتف.");
      return;
    }

    const payload =
      mode === "code"
        ? { orderCode: trimmed }
        : { phone: trimmed.replace(/[^0-9+]/g, "") };

    setError(null);
    resetState();

    startTransition(async () => {
      try {
        const response = await fetch("/api/orders/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError(
              mode === "code"
                ? "الطلب غير موجود. يرجى التحقق من رقم الطلب."
                : "لا توجد طلبات مرتبطة بهذا الرقم.",
            );
          } else {
            setError("تعذر جلب بيانات الطلب. يرجى المحاولة مرة أخرى.");
          }
          return;
        }

        const data = await response.json();
        const fetchedOrders: OrderData[] =
          data?.data?.orders && Array.isArray(data.data.orders)
            ? data.data.orders
            : [];

        if (!fetchedOrders.length) {
          setError(
            mode === "code"
              ? "الطلب غير موجود. يرجى التحقق من رقم الطلب."
              : "لا توجد طلبات مرتبطة بهذا الرقم.",
          );
          return;
        }

        setOrders(fetchedOrders);
        setSelectedOrderCode(fetchedOrders[0]?.orderCode ?? null);

        if (mode === "code") {
          setOrderCode(trimmed);
        } else {
          setPhoneNumber(trimmed);
        }
      } catch (error) {
        console.error("Failed to fetch order", error);
        setError("حدث خطأ أثناء جلب بيانات الطلب. تحقق من الاتصال بالإنترنت.");
      }
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const codeInput = form.querySelector<HTMLInputElement>('input[name="orderNumber"]');
    const phoneInput = form.querySelector<HTMLInputElement>('input[name="phoneNumber"]');

    if (trackMode === "code") {
      const code = codeInput?.value.trim() || orderCode;
      fetchOrders("code", code);
    } else {
      const phone = phoneInput?.value.trim() || phoneNumber;
      fetchOrders("phone", phone);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-[color:var(--color-foreground)]">
          تتبع حالة طلبك
        </h1>
        <p className="text-sm text-[color:var(--color-foreground-muted)]">
          أدخل رقم الطلب أو رقم الهاتف الذي استخدمته أثناء الشراء للاطلاع على
          آخر المستجدات.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-3xl border border-[rgba(10,110,92,0.12)] bg-white p-6 shadow-sm sm:flex-row sm:items-center"
      >
        <div className="flex flex-col gap-3 sm:flex-1">
          <div className="flex items-center gap-2 rounded-2xl bg-[color:var(--color-surface-muted)] p-1">
            <button
              type="button"
              onClick={() => {
                setTrackMode("code");
                setError(null);
                resetState();
              }}
              className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                trackMode === "code"
                  ? "bg-white text-[color:var(--color-primary)] shadow"
                  : "text-[color:var(--color-foreground-muted)]"
              }`}
            >
              بواسطة رقم الطلب
            </button>
            <button
              type="button"
              onClick={() => {
                setTrackMode("phone");
                setError(null);
                resetState();
              }}
              className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                trackMode === "phone"
                  ? "bg-white text-[color:var(--color-primary)] shadow"
                  : "text-[color:var(--color-foreground-muted)]"
              }`}
            >
              بواسطة رقم الهاتف
            </button>
          </div>

          {trackMode === "code" ? (
            <label className="flex flex-col gap-2 text-sm text-[color:var(--color-foreground-muted)]">
              رقم الطلب
              <input
                name="orderNumber"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                className="rounded-2xl border border-[rgba(10,110,92,0.2)] bg-[color:var(--color-surface-muted)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                placeholder="أدخل رقم الطلب"
                required
              />
            </label>
          ) : (
            <label className="flex flex-col gap-2 text-sm text-[color:var(--color-foreground-muted)]">
              رقم الهاتف المستخدم في الطلب
              <input
                name="phoneNumber"
                type="tel"
                inputMode="numeric"
                maxLength={8}
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
                  setPhoneNumber(value);
                }}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab") {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedText = (e.clipboardData || (window as any).clipboardData).getData("text");
                  const numbersOnly = pastedText.replace(/[^0-9]/g, "").slice(0, 8);
                  setPhoneNumber(numbersOnly);
                }}
                className="rounded-2xl border border-[rgba(10,110,92,0.2)] bg-[color:var(--color-surface-muted)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                placeholder="مثال: 12345678"
                required
              />
            </label>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-full bg-[color:var(--color-primary)] px-6 py-3 text-base font-semibold text-[color:var(--color-primary-foreground)] transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "جاري البحث..." : "عرض الحالة"}
        </button>
      </form>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {orders.length > 1 && (
        <div className="rounded-3xl border border-[rgba(10,110,92,0.12)] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[color:var(--color-foreground)]">
            الطلبات المرتبطة بهذا الرقم
          </h2>
          <div className="flex flex-col gap-3">
            {orders.map((item) => (
              <button
                key={item.orderCode}
                type="button"
                onClick={() => setSelectedOrderCode(item.orderCode)}
                className={`flex flex-col gap-2 rounded-2xl border px-4 py-3 text-right transition ${
                  selectedOrderCode === item.orderCode
                    ? "border-[color:var(--color-primary)] bg-[color:var(--color-surface-muted)]"
                    : "border-[rgba(10,110,92,0.12)] hover:border-[color:var(--color-primary)]/40"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[color:var(--color-primary)]">
                    {item.orderCode}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      statusColors[item.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {statusLabels[item.status] || item.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-foreground-muted)]">
                  <span>
                    التاريخ:{" "}
                    {new Date(item.createdAt).toLocaleDateString("ar-TN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span>
                    الإجمالي:{" "}
                  {item.total.toLocaleString("ar-TN", {
                      style: "currency",
                      currency: "TND",
                      maximumFractionDigits: 3,
                    })}
                  </span>
                  <span>المدينة: {item.city}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-[rgba(10,110,92,0.12)] bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[color:var(--color-foreground-muted)]">
                  رقم الطلب
                </p>
                <p className="text-xl font-bold text-[color:var(--color-primary)]">
                  {selectedOrder.orderCode}
                </p>
              </div>
              <div
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  statusColors[selectedOrder.status] || "bg-gray-100 text-gray-700"
                }`}
              >
                {statusLabels[selectedOrder.status] || selectedOrder.status}
              </div>
            </div>

            <div className="grid gap-4 border-t border-[rgba(10,110,92,0.12)] pt-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[color:var(--color-foreground-muted)]">
                  اسم العميل
                </p>
                <p className="text-sm font-medium text-[color:var(--color-foreground)]">
                  {selectedOrder.customerName}
                </p>
              </div>
              <div>
                <p className="text-xs text-[color:var(--color-foreground-muted)]">
                  رقم الهاتف
                </p>
                <p className="text-sm font-medium text-[color:var(--color-foreground)]">
                  {selectedOrder.phone}
                </p>
              </div>
              <div>
                <p className="text-xs text-[color:var(--color-foreground-muted)]">
                  المدينة
                </p>
                <p className="text-sm font-medium text-[color:var(--color-foreground)]">
                  {selectedOrder.city}
                </p>
              </div>
              <div>
                <p className="text-xs text-[color:var(--color-foreground-muted)]">
                  العنوان
                </p>
                <p className="text-sm font-medium text-[color:var(--color-foreground)]">
                  {selectedOrder.address}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[rgba(10,110,92,0.12)] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[color:var(--color-foreground)]">
              الكتب المطلوبة
            </h2>
            <div className="flex flex-col gap-3">
              {selectedOrder.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl bg-[color:var(--color-surface-muted)] px-4 py-3 text-sm"
                >
                  <div className="flex flex-col">
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
                  {selectedOrder.subtotal.toLocaleString("ar-TN", {
                    style: "currency",
                    currency: "TND",
                    maximumFractionDigits: 3,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-[color:var(--color-foreground-muted)]">
                <span>رسوم التوصيل</span>
                <span>
                  {selectedOrder.deliveryFees.toLocaleString("ar-TN", {
                    style: "currency",
                    currency: "TND",
                    maximumFractionDigits: 3,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-[rgba(10,110,92,0.2)] pt-3 text-base font-semibold text-[color:var(--color-foreground)]">
                <span>الإجمالي</span>
                <span>
                  {selectedOrder.total.toLocaleString("ar-TN", {
                    style: "currency",
                    currency: "TND",
                    maximumFractionDigits: 3,
                  })}
                </span>
              </div>
            </div>
          </div>

          {selectedOrder.deliveryPartner && (
            <div className="rounded-3xl border border-[rgba(10,110,92,0.12)] bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-[color:var(--color-foreground)]">
                شريك التوصيل
              </h2>
              <div className="flex flex-col gap-2 text-sm">
                <p className="font-medium text-[color:var(--color-foreground)]">
                  {selectedOrder.deliveryPartner.name}
                </p>
                {selectedOrder.deliveryPartner.contactName && (
                  <p className="text-[color:var(--color-foreground-muted)]">
                    {selectedOrder.deliveryPartner.contactName}
                  </p>
                )}
                {selectedOrder.deliveryPartner.contactPhone && (
                  <p className="text-[color:var(--color-foreground-muted)]">
                    {selectedOrder.deliveryPartner.contactPhone}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-[rgba(10,110,92,0.12)] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[color:var(--color-foreground)]">
              سجل حالة الطلب
            </h2>
            <div className="flex flex-col gap-3">
              {selectedOrder.statusHistory
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
                        <p className="text-xs text-[color:var(--color-foreground-muted)]">
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
        </div>
      )}

      {orders.length === 0 && !error && !isLoading && (
        <div className="rounded-3xl border border-[rgba(10,110,92,0.12)] bg-[color:var(--color-surface-muted)] p-6 text-sm text-[color:var(--color-foreground-muted)]">
          أدخل رقم الطلب أو رقم الهاتف أعلاه لعرض حالة الطلب وخط الزمن: قيد
          المعالجة → تم الإرسال → تم التسليم.
        </div>
      )}
    </section>
  );
}

