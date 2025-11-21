"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

type NewsletterStats = {
  total: number;
  totalAllTime: number;
  last7Days: number;
  previous7Days: number;
  growthRate: number;
  bySource: {
    footer: number;
    signup: number;
    checkout: number;
  };
};

type Subscriber = {
  _id: string;
  email: string;
  name?: string;
  source: "footer" | "signup" | "checkout";
  isActive: boolean;
  subscribedAt: string;
  interests?: string[];
  locale?: string;
  tags?: string[];
};

export function NewsletterManager() {
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<string>("active");

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/newsletter/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filterSource !== "all") {
        params.append("source", filterSource);
      }
      if (filterActive !== "all") {
        params.append("isActive", filterActive === "active" ? "true" : "false");
      }

      const response = await fetch(
        `/api/admin/newsletter/subscribers?${params.toString()}`,
      );
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data);
      } else {
        toast.error("حدث خطأ أثناء جلب المشتركين");
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast.error("حدث خطأ أثناء جلب المشتركين");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [filterSource, filterActive]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filterSource !== "all") {
        params.append("source", filterSource);
      }
      if (filterActive !== "all") {
        params.append("isActive", filterActive === "active" ? "true" : "false");
      }

      const response = await fetch(
        `/api/admin/newsletter/export?${params.toString()}`,
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("تم تصدير البيانات بنجاح");
      } else {
        toast.error("حدث خطأ أثناء التصدير");
      }
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error("حدث خطأ أثناء التصدير");
    }
  };

  const sourceLabels: Record<string, string> = {
    footer: "التذييل",
    signup: "التسجيل",
    checkout: "الدفع",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">
            إدارة النشرة الإخبارية
          </h1>
          <p className="mt-1 text-sm text-[color:var(--color-foreground-muted)]">
            عرض وإدارة المشتركين في النشرة الإخبارية
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl bg-[color:var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          تصدير CSV
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-[color:var(--color-foreground-muted)]">
              إجمالي المشتركين النشطين
            </div>
            <div className="mt-2 text-2xl font-bold text-[color:var(--color-foreground)]">
              {stats.total.toLocaleString("ar-TN")}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-[color:var(--color-foreground-muted)]">
              آخر 7 أيام
            </div>
            <div className="mt-2 text-2xl font-bold text-[color:var(--color-foreground)]">
              {stats.last7Days.toLocaleString("ar-TN")}
            </div>
            {stats.growthRate !== 0 && (
              <div
                className={`mt-1 text-xs ${
                  stats.growthRate > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.growthRate > 0 ? "↑" : "↓"}{" "}
                {Math.abs(stats.growthRate).toFixed(1)}%
              </div>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-[color:var(--color-foreground-muted)]">
              إجمالي المشتركين (كل الأوقات)
            </div>
            <div className="mt-2 text-2xl font-bold text-[color:var(--color-foreground)]">
              {stats.totalAllTime.toLocaleString("ar-TN")}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-[color:var(--color-foreground-muted)]">
              حسب المصدر
            </div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>التذييل:</span>
                <span className="font-semibold">{stats.bySource.footer}</span>
              </div>
              <div className="flex justify-between">
                <span>التسجيل:</span>
                <span className="font-semibold">{stats.bySource.signup}</span>
              </div>
              <div className="flex justify-between">
                <span>الدفع:</span>
                <span className="font-semibold">{stats.bySource.checkout}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[color:var(--color-foreground)]">
            المصدر
          </label>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
          >
            <option value="all">الكل</option>
            <option value="footer">التذييل</option>
            <option value="signup">التسجيل</option>
            <option value="checkout">الدفع</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[color:var(--color-foreground)]">
            الحالة
          </label>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
          >
            <option value="all">الكل</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                  البريد الإلكتروني
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                  الاسم
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                  المصدر
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                  الحالة
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--color-foreground)]">
                  تاريخ الاشتراك
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[color:var(--color-foreground-muted)]">
                    جاري التحميل...
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[color:var(--color-foreground-muted)]">
                    لا توجد نتائج
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-[color:var(--color-foreground)]">
                      {sub.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-[color:var(--color-foreground)]">
                      {sub.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[color:var(--color-foreground)]">
                      {sourceLabels[sub.source] || sub.source}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          sub.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {sub.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[color:var(--color-foreground)]">
                      {new Date(sub.subscribedAt).toLocaleDateString("ar-TN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

