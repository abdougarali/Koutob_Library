"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cartStore";
import toast from "react-hot-toast";

type Order = {
  _id: string;
  orderCode: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    book?: string | null;
    title: string;
    quantity: number;
    price: number;
  }>;
};

type CustomerOrdersClientProps = {
  orders: Order[];
};

export function CustomerOrdersClient({ orders }: CustomerOrdersClientProps) {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addItem);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "تم التسليم":
        return "bg-green-100 text-green-700";
      case "تم الإرسال":
        return "bg-blue-100 text-blue-700";
      case "قيد المعالجة":
        return "bg-yellow-100 text-yellow-700";
      case "تم الإلغاء":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleQuickReorder = (order: Order) => {
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--color-foreground)] sm:text-3xl">
          طلباتي
        </h1>
        <p className="mt-1 text-xs text-[color:var(--color-foreground-muted)] sm:mt-2 sm:text-sm">
          عرض جميع طلباتك وتتبع حالتها
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm sm:p-12">
          <p className="text-base text-[color:var(--color-foreground-muted)] sm:text-lg">
            لا توجد طلبات حتى الآن
          </p>
          <Link
            href="/books"
            className="mt-4 inline-block rounded-lg bg-[color:var(--color-primary)] px-5 py-2.5 text-xs font-medium text-white transition hover:opacity-90 sm:px-6 sm:py-3 sm:text-sm"
          >
            تصفح الكتب
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile: Card Layout */}
          <div className="grid gap-3 sm:hidden">
            {orders.map((order) => (
              <div
                key={order._id}
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
                      التاريخ
                    </span>
                    <span className="text-xs text-[color:var(--color-foreground-muted)]">
                      {new Date(order.createdAt).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                      العناصر
                    </span>
                    <span className="text-xs text-[color:var(--color-foreground-muted)]">
                      {order.items.length} {order.items.length === 1 ? "عنصر" : "عناصر"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                      الحالة
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[color:var(--color-foreground-muted)]">
                      الإجمالي
                    </span>
                    <span className="text-sm font-semibold text-[color:var(--color-foreground)]">
                      {order.total.toFixed(2)} د.ت
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <Link
                      href={`/dashboard/orders/${encodeURIComponent(order.orderCode)}`}
                      className="min-h-[36px] rounded-lg bg-blue-50 px-3 py-2 text-center text-[10px] font-medium text-blue-600 transition active:bg-blue-100"
                    >
                      عرض التفاصيل
                    </Link>
                    {order.status === "تم التسليم" && (
                      <button
                        onClick={() => handleQuickReorder(order)}
                        className="min-h-[36px] rounded-lg bg-green-50 px-3 py-2 text-[10px] font-medium text-green-700 transition active:bg-green-100"
                      >
                        إعادة الطلب
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table Layout */}
          <div className="hidden overflow-x-auto sm:block">
            <div className="rounded-2xl bg-white shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                      رقم الطلب
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                      التاريخ
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                      العناصر
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                      الحالة
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                      الإجمالي
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-sm font-medium text-[color:var(--color-foreground)]">
                        {order.orderCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-[color:var(--color-foreground-muted)]">
                        {new Date(order.createdAt).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-[color:var(--color-foreground-muted)]">
                        {order.items.length} {order.items.length === 1 ? "عنصر" : "عناصر"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[color:var(--color-foreground)]">
                        {order.total.toFixed(2)} د.ت
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/orders/${encodeURIComponent(order.orderCode)}`}
                            className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                          >
                            التفاصيل
                          </Link>
                          {order.status === "تم التسليم" && (
                            <button
                              onClick={() => handleQuickReorder(order)}
                              className="rounded-lg bg-green-50 px-3 py-1 text-xs font-medium text-green-700 transition hover:bg-green-100"
                            >
                              إعادة الطلب
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
















