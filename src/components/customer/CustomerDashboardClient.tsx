"use client";

import Link from "next/link";

type Order = {
  _id: string;
  orderCode: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
};

type CustomerDashboardClientProps = {
  user: {
    name: string;
    email: string;
  };
  initialOrders: Order[];
};

export function CustomerDashboardClient({
  user,
  initialOrders,
}: CustomerDashboardClientProps) {
  const recentOrders = initialOrders.slice(0, 5);

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

  return (
    <div className="space-y-5 sm:space-y-6" dir="rtl">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <p className="text-sm text-[color:var(--color-foreground-muted)]">
          مرحباً 👋
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[color:var(--color-foreground)] sm:text-3xl">
          {user.name}
        </h1>
        <p className="mt-1 text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
          {user.email}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[color:var(--color-foreground-muted)]">
                إجمالي الطلبات
              </p>
              <p className="mt-2 text-3xl font-bold text-[color:var(--color-foreground)]">
                {initialOrders.length}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[color:var(--color-foreground-muted)]">
                قيد المعالجة
              </p>
              <p className="mt-2 text-3xl font-bold text-[color:var(--color-foreground)]">
                {initialOrders.filter((o) => o.status === "قيد المعالجة").length}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[color:var(--color-foreground-muted)]">
                تم التسليم
              </p>
              <p className="mt-2 text-3xl font-bold text-[color:var(--color-foreground)]">
                {initialOrders.filter((o) => o.status === "تم التسليم").length}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-[color:var(--color-foreground)] sm:text-xl">
            الطلبات الأخيرة
          </h2>
          <Link
            href="/dashboard/orders"
            className="text-xs font-semibold text-[color:var(--color-primary)] hover:underline sm:text-sm"
          >
            عرض جميع الطلبات
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-10 text-center sm:py-12">
            <p className="text-sm text-[color:var(--color-foreground-muted)] sm:text-base">
              لا توجد طلبات حتى الآن
            </p>
            <Link
              href="/books"
              className="mt-4 inline-block rounded-xl bg-[color:var(--color-primary)] px-5 py-2 text-xs font-semibold text-white transition hover:opacity-90 sm:px-6 sm:py-2.5 sm:text-sm"
            >
              تصفح الكتب
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="grid gap-3 sm:hidden">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-2xl border border-gray-100 p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                      {order.orderCode}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-[color:var(--color-foreground-muted)]">
                    {new Date(order.createdAt).toLocaleDateString("ar-SA", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm font-semibold text-[color:var(--color-foreground)]">
                    <span>الإجمالي</span>
                    <span>{order.total.toFixed(2)} د.ت</span>
                  </div>
                  <Link
                    href={`/orders/track?code=${order.orderCode}`}
                    className="mt-3 block rounded-lg bg-blue-50 px-3 py-2 text-center text-xs font-medium text-blue-600"
                  >
                    عرض التفاصيل
                  </Link>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
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
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-sm font-medium text-[color:var(--color-foreground)]">
                        {order.orderCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-[color:var(--color-foreground-muted)]">
                        {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[color:var(--color-foreground)]">
                        {order.total.toFixed(2)} د.ت
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/orders/track?code=${order.orderCode}`}
                          className="text-sm text-[color:var(--color-primary)] hover:underline"
                        >
                          التفاصيل
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

















