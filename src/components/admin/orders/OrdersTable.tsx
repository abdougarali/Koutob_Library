"use client";

import { useState, useTransition } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import toast from "react-hot-toast";
import { useMemo } from "react";
import { CustomSelect } from "@/components/shared/CustomSelect";

type OrderItem = {
  title: string;
  price: number;
  quantity: number;
};

type AdminOrder = {
  _id?: string;
  orderCode: string;
  customerName: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFees: number;
  total: number;
  deliveryPartner?: {
    _id?: string;
    name?: string;
  } | null;
  createdAt?: string;
};

type OrdersTableProps = {
  initialOrders: AdminOrder[];
};

export function OrdersTable({ initialOrders }: OrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [isPending, startTransition] = useTransition();

  const exportUrlTxt = useMemo(() => {
    // If you add filters, append them similarly here
    return "/api/admin/orders/export?format=txt";
  }, []);

  const handleStatusUpdate = async (orderCode: string, newStatus: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/orders/${orderCode}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          toast.error("حدث خطأ أثناء التحديث");
          return;
        }

        const responseData = await response.json();
        const updatedOrder = responseData.data || responseData;
        setOrders(
          orders.map((o) =>
            o.orderCode === orderCode
              ? { ...updatedOrder, _id: updatedOrder._id?.toString() || updatedOrder._id }
              : o,
          ),
        );
        toast.success("تم تحديث حالة الطلب بنجاح");
      } catch (error) {
        console.error("Error updating order:", error);
        toast.error("حدث خطأ أثناء التحديث");
      }
    });
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[color:var(--color-foreground)]">
          إدارة الطلبات
        </h2>
        <a
          href={exportUrlTxt}
          className="rounded-xl bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          title="تصدير الطلبات (TXT)"
        >
          تصدير TXT
        </a>
      </div>

      {/* Mobile: Card Layout */}
      <div className="grid gap-3 sm:hidden">
        {orders.map((order, index) => (
          <div
            key={order._id || order.orderCode || `order-${index}`}
            className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  رقم الطلب
                </span>
                <span className="text-sm font-semibold text-[color:var(--color-foreground)]">
                  {order.orderCode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  العميل
                </span>
                <div className="text-left">
                  <div className="text-sm font-medium text-[color:var(--color-foreground)]">
                    {order.customerName}
                  </div>
                  <div className="text-xs text-[color:var(--color-foreground-muted)]">{order.phone}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  المدينة
                </span>
                <span className="text-sm text-[color:var(--color-foreground-muted)]">{order.city}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  الإجمالي
                </span>
                <span className="text-sm font-semibold text-[color:var(--color-foreground)]">
                  {order.total} د.ت
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  الحالة
                </span>
                <div className="flex items-center gap-2">
                  <CustomSelect
                    value={order.status}
                    onChange={(value) => handleStatusUpdate(order.orderCode, value)}
                    disabled={isPending}
                    options={[
                      { value: "قيد المعالجة", label: "قيد المعالجة" },
                      { value: "تم الإرسال", label: "تم الإرسال" },
                      { value: "تم التسليم", label: "تم التسليم" },
                      { value: "تم الإلغاء", label: "تم الإلغاء" },
                    ]}
                    placeholder="اختر الحالة"
                    className="w-full [&>button]:rounded-lg [&>button]:border-gray-300 [&>button]:px-3 [&>button]:py-2 [&>button]:text-xs [&>button]:font-medium"
                  />
                  {isPending && <LoadingSpinner size="sm" />}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                  الإجراءات
                </span>
                <div className="flex gap-2">
                  <a
                    href={`/orders/track?code=${order.orderCode}`}
                    target="_blank"
                    className="min-h-[36px] flex-1 rounded-lg bg-blue-50 px-3 py-2 text-center text-[10px] font-medium text-blue-600 transition active:bg-blue-100"
                  >
                    عرض
                  </a>
                  <a
                    href={`/admin/orders/${order.orderCode}/invoice`}
                    target="_blank"
                    className="min-h-[36px] flex-1 rounded-lg bg-green-50 px-3 py-2 text-center text-[10px] font-medium text-green-700 transition active:bg-green-100"
                  >
                    فاتورة
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                رقم الطلب
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                العميل
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                المدينة
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                الإجمالي
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                الحالة
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order._id || order.orderCode || `order-${index}`} className="border-b border-gray-100">
                <td className="px-4 py-3 text-sm font-medium text-[color:var(--color-foreground)]">
                  {order.orderCode}
                </td>
                <td className="px-4 py-3 text-sm text-[color:var(--color-foreground-muted)]">
                  <div>{order.customerName}</div>
                  <div className="text-xs">{order.phone}</div>
                </td>
                <td className="px-4 py-3 text-sm text-[color:var(--color-foreground-muted)]">
                  {order.city}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-[color:var(--color-foreground)]">
                  {order.total} د.ت
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CustomSelect
                      value={order.status}
                      onChange={(value) => handleStatusUpdate(order.orderCode, value)}
                      disabled={isPending}
                      options={[
                        { value: "قيد المعالجة", label: "قيد المعالجة" },
                        { value: "تم الإرسال", label: "تم الإرسال" },
                        { value: "تم التسليم", label: "تم التسليم" },
                        { value: "تم الإلغاء", label: "تم الإلغاء" },
                      ]}
                      placeholder="اختر الحالة"
                      className="min-w-[140px] [&>button]:rounded-lg [&>button]:border-gray-300 [&>button]:px-3 [&>button]:py-2 [&>button]:text-xs [&>button]:font-medium sm:[&>button]:py-1.5 sm:[&>button]:text-sm"
                    />
                    {isPending && <LoadingSpinner size="sm" />}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <a
                      href={`/orders/track?code=${order.orderCode}`}
                      target="_blank"
                      className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                    >
                      عرض
                    </a>
                    <a
                      href={`/admin/orders/${order.orderCode}/invoice`}
                      target="_blank"
                      className="rounded-lg bg-green-50 px-3 py-1 text-xs font-medium text-green-700 transition hover:bg-green-100"
                    >
                      فاتورة
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}




