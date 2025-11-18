"use client";

import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { LowStockAlert } from "./LowStockAlert";
import Link from "next/link";

type AnalyticsData = {
  sales: {
    totalRevenue: number;
    todayRevenue: number;
    thisWeekRevenue: number;
    thisMonthRevenue: number;
    averageOrderValue: number;
  };
  orders: {
    totalOrders: number;
    todayOrders: number;
    thisWeekOrders: number;
    thisMonthOrders: number;
    ordersByStatus: {
      "قيد المعالجة": number;
      "تم الإرسال": number;
      "تم التسليم": number;
      "تم الإلغاء": number;
    };
    recentOrders: Array<{
      orderCode: string;
      customerName: string;
      total: number;
      status: string;
      createdAt: string;
    }>;
  };
  books: {
    totalBooks: number;
    publishedBooks: number;
    lowStockBooks: number;
    outOfStockBooks: number;
    topSellingBooks: Array<{
      title: string;
      slug: string;
      totalSold: number;
      revenue: number;
    }>;
    booksByCategory: Array<{
      category: string;
      count: number;
    }>;
  };
  customers: {
    totalCustomers: number;
    newCustomersThisMonth: number;
    activeCustomers: number;
  };
};

export function AdminDashboardClient() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordersByStatusPage, setOrdersByStatusPage] = useState(1);
  const [recentOrdersPage, setRecentOrdersPage] = useState(1);
  const [topSellingPage, setTopSellingPage] = useState(1);
  const [booksByCategoryPage, setBooksByCategoryPage] = useState(1);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/admin/analytics");
        if (!response.ok) {
          throw new Error("فشل في جلب البيانات");
        }
        const data = await response.json();
        setAnalytics(data.data);
      } catch (err: any) {
        console.error("Error fetching analytics:", err);
        setError(err.message || "حدث خطأ أثناء جلب البيانات");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (!analytics) {
      return;
    }
    setOrdersByStatusPage(1);
    setRecentOrdersPage(1);
    setTopSellingPage(1);
    setBooksByCategoryPage(1);
  }, [analytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="text-center text-red-600">
          {error || "فشل في تحميل البيانات"}
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("ar-TN", {
      style: "currency",
      currency: "TND",
      maximumFractionDigits: 3,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-TN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "قيد المعالجة":
        return "bg-orange-100 text-orange-700";
      case "تم الإرسال":
        return "bg-blue-100 text-blue-700";
      case "تم التسليم":
        return "bg-green-100 text-green-700";
      case "تم الإلغاء":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const ordersByStatusEntries = Object.entries(
    analytics.orders.ordersByStatus
  );
  const ORDERS_BY_STATUS_PER_PAGE = 4;
  const ordersByStatusTotalPages = Math.max(
    1,
    Math.ceil(ordersByStatusEntries.length / ORDERS_BY_STATUS_PER_PAGE)
  );
  const safeOrdersByStatusPage = Math.min(
    ordersByStatusPage,
    ordersByStatusTotalPages
  );
  const visibleOrdersByStatus = ordersByStatusEntries.slice(
    (safeOrdersByStatusPage - 1) * ORDERS_BY_STATUS_PER_PAGE,
    safeOrdersByStatusPage * ORDERS_BY_STATUS_PER_PAGE
  );

  const RECENT_ORDERS_PER_PAGE = 5;
  const recentOrdersTotalPages = Math.max(
    1,
    Math.ceil(analytics.orders.recentOrders.length / RECENT_ORDERS_PER_PAGE)
  );
  const safeRecentOrdersPage = Math.min(
    recentOrdersPage,
    recentOrdersTotalPages
  );
  const visibleRecentOrders = analytics.orders.recentOrders.slice(
    (safeRecentOrdersPage - 1) * RECENT_ORDERS_PER_PAGE,
    safeRecentOrdersPage * RECENT_ORDERS_PER_PAGE
  );

  const TOP_SELLING_PER_PAGE = 5;
  const topSellingTotalPages = Math.max(
    1,
    Math.ceil(analytics.books.topSellingBooks.length / TOP_SELLING_PER_PAGE)
  );
  const safeTopSellingPage = Math.min(topSellingPage, topSellingTotalPages);
  const visibleTopSellingBooks = analytics.books.topSellingBooks.slice(
    (safeTopSellingPage - 1) * TOP_SELLING_PER_PAGE,
    safeTopSellingPage * TOP_SELLING_PER_PAGE
  );

  const BOOKS_BY_CATEGORY_PER_PAGE = 6;
  const booksByCategoryTotalPages = Math.max(
    1,
    Math.ceil(
      analytics.books.booksByCategory.length / BOOKS_BY_CATEGORY_PER_PAGE
    )
  );
  const safeBooksByCategoryPage = Math.min(
    booksByCategoryPage,
    booksByCategoryTotalPages
  );
  const visibleBooksByCategory = analytics.books.booksByCategory.slice(
    (safeBooksByCategoryPage - 1) * BOOKS_BY_CATEGORY_PER_PAGE,
    safeBooksByCategoryPage * BOOKS_BY_CATEGORY_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[color:var(--color-foreground)]">
          لوحة التحكم
        </h1>
        <p className="mt-2 text-[color:var(--color-foreground-muted)]">
          نظرة عامة على إحصائيات المتجر
        </p>
      </div>

      {/* Low Stock Alert */}
      {analytics.books.lowStockBooks > 0 && (
        <LowStockAlert />
      )}

      {/* Sales Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي الإيرادات"
          value={formatCurrency(analytics.sales.totalRevenue)}
          icon="💰"
          trend={null}
        />
        <StatCard
          title="إيرادات اليوم"
          value={formatCurrency(analytics.sales.todayRevenue)}
          icon="📅"
          trend={null}
        />
        <StatCard
          title="إيرادات هذا الأسبوع"
          value={formatCurrency(analytics.sales.thisWeekRevenue)}
          icon="📊"
          trend={null}
        />
        <StatCard
          title="متوسط قيمة الطلب"
          value={formatCurrency(analytics.sales.averageOrderValue)}
          icon="📈"
          trend={null}
        />
      </div>

      {/* Orders & Customers Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي الطلبات"
          value={analytics.orders.totalOrders.toString()}
          icon="📦"
          trend={null}
        />
        <StatCard
          title="طلبات اليوم"
          value={analytics.orders.todayOrders.toString()}
          icon="🆕"
          trend={null}
        />
        <StatCard
          title="إجمالي العملاء"
          value={analytics.customers.totalCustomers.toString()}
          icon="👥"
          trend={null}
        />
        <StatCard
          title="عملاء جدد هذا الشهر"
          value={analytics.customers.newCustomersThisMonth.toString()}
          icon="✨"
          trend={null}
        />
      </div>

      {/* Books Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي الكتب"
          value={analytics.books.totalBooks.toString()}
          icon="📚"
          trend={null}
        />
        <StatCard
          title="كتب منشورة"
          value={analytics.books.publishedBooks.toString()}
          icon="✅"
          trend={null}
        />
        <StatCard
          title="كتب قليلة المخزون"
          value={analytics.books.lowStockBooks.toString()}
          icon="⚠️"
          trend={analytics.books.lowStockBooks > 0 ? "warning" : null}
        />
        <StatCard
          title="كتب غير متوفرة"
          value={analytics.books.outOfStockBooks.toString()}
          icon="❌"
          trend={analytics.books.outOfStockBooks > 0 ? "error" : null}
        />
      </div>

      {/* Orders by Status & Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by Status */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-[color:var(--color-foreground)]">
            الطلبات حسب الحالة
          </h2>
          <div className="space-y-3">
            {visibleOrdersByStatus.map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
              >
                <span className="text-sm font-medium text-[color:var(--color-foreground)]">
                  {status}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${getStatusColor(status)}`}
                >
                  {count}
                </span>
              </div>
            ))}
          </div>
          {ordersByStatusEntries.length > ORDERS_BY_STATUS_PER_PAGE && (
            <PaginationControls
              currentPage={safeOrdersByStatusPage}
              totalPages={ordersByStatusTotalPages}
              onPageChange={(page) => setOrdersByStatusPage(page)}
            />
          )}
        </div>

        {/* Recent Orders */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
              الطلبات الأخيرة
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-[color:var(--color-primary)] hover:underline"
            >
              عرض الكل
            </Link>
          </div>
          <div className="space-y-3">
            {analytics.orders.recentOrders.length === 0 ? (
              <p className="text-sm text-[color:var(--color-foreground-muted)]">
                لا توجد طلبات حديثة
              </p>
            ) : (
              visibleRecentOrders.map((order) => (
                <div
                  key={order.orderCode}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[color:var(--color-foreground)]">
                        {order.orderCode}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[color:var(--color-foreground-muted)]">
                      {order.customerName} • {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[color:var(--color-foreground)]">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              ))
            )}
          </div>
          {analytics.orders.recentOrders.length > RECENT_ORDERS_PER_PAGE && (
            <PaginationControls
              currentPage={safeRecentOrdersPage}
              totalPages={recentOrdersTotalPages}
              onPageChange={(page) => setRecentOrdersPage(page)}
            />
          )}
        </div>
      </div>

      {/* Top Selling Books & Books by Category */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Selling Books */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
              الكتب الأكثر مبيعاً
            </h2>
            <Link
              href="/admin/books"
              className="text-sm text-[color:var(--color-primary)] hover:underline"
            >
              عرض الكل
            </Link>
          </div>
          <div className="space-y-3">
            {analytics.books.topSellingBooks.length === 0 ? (
              <p className="text-sm text-[color:var(--color-foreground-muted)]">
                لا توجد بيانات مبيعات
              </p>
            ) : (
              visibleTopSellingBooks.map((book, index) => (
                <div
                  key={book.slug}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-sm font-bold text-white">
                      {(safeTopSellingPage - 1) * TOP_SELLING_PER_PAGE +
                        (index + 1)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[color:var(--color-foreground)]">
                        {book.title}
                      </p>
                      <p className="text-xs text-[color:var(--color-foreground-muted)]">
                        {book.totalSold} نسخة
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[color:var(--color-primary)]">
                    {formatCurrency(book.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
          {analytics.books.topSellingBooks.length > TOP_SELLING_PER_PAGE && (
            <PaginationControls
              currentPage={safeTopSellingPage}
              totalPages={topSellingTotalPages}
              onPageChange={(page) => setTopSellingPage(page)}
            />
          )}
        </div>

        {/* Books by Category */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-[color:var(--color-foreground)]">
            الكتب حسب التصنيف
          </h2>
          <div className="space-y-3">
            {analytics.books.booksByCategory.length === 0 ? (
              <p className="text-sm text-[color:var(--color-foreground-muted)]">
                لا توجد تصنيفات
              </p>
            ) : (
              visibleBooksByCategory.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                >
                  <span className="text-sm font-medium text-[color:var(--color-foreground)]">
                    {item.category}
                  </span>
                  <span className="rounded-full bg-[color:var(--color-primary)] px-3 py-1 text-sm font-bold text-white">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
          {analytics.books.booksByCategory.length >
            BOOKS_BY_CATEGORY_PER_PAGE && (
            <PaginationControls
              currentPage={safeBooksByCategoryPage}
              totalPages={booksByCategoryTotalPages}
              onPageChange={(page) => setBooksByCategoryPage(page)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  icon: string;
  trend: "up" | "down" | "warning" | "error" | null;
};

function StatCard({ title, value, icon, trend }: StatCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "border-green-200 bg-green-50";
      case "down":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-orange-200 bg-orange-50";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-white";
    }
  };

  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm transition hover:shadow-md ${getTrendColor()}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[color:var(--color-foreground-muted)]">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-[color:var(--color-foreground)]">
            {value}
          </p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-[color:var(--color-foreground-muted)]">
      <button
        type="button"
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="rounded-xl border border-gray-200 px-3 py-1 text-xs font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        السابق
      </button>
      <span>
        صفحة {currentPage} من {totalPages}
      </span>
      <button
        type="button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="rounded-xl border border-gray-200 px-3 py-1 text-xs font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        التالي
      </button>
    </div>
  );
}






