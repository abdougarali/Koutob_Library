"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type LowStockBook = {
  _id: string;
  slug: string;
  title: string;
  stock: number;
  lowStockThreshold: number;
};

export function LowStockAlert() {
  const [books, setBooks] = useState<LowStockBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLowStockBooks = useCallback(
    async (isInitial = false) => {
      try {
        if (isInitial) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const response = await fetch("/api/admin/books/low-stock", {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setBooks(data.books || []);
        }
      } catch (error) {
        console.error("Error fetching low stock books:", error);
      } finally {
        if (isInitial) {
          setLoading(false);
        }
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchLowStockBooks(true);
  }, [fetchLowStockBooks]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
        <div className="text-sm text-orange-700">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="text-lg font-semibold text-orange-900">
              تنبيهات المخزون
            </h3>
            {refreshing && (
              <p className="text-xs text-orange-700">جارٍ تحديث القائمة...</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchLowStockBooks(false)}
            disabled={refreshing}
            className="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-xs font-semibold text-orange-900 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            إعادة تحميل
          </button>
          <span className="rounded-full bg-orange-200 px-3 py-1 text-sm font-bold text-orange-900">
            {books.length}
          </span>
        </div>
      </div>
      {books.length === 0 ? (
        <p className="text-sm font-medium text-orange-800">
          لا توجد كتب بحاجة إلى إعادة تخزين حالياً.
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-orange-800">
            الكتب التالية تحتاج إلى إعادة تخزين:
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {books.slice(0, 10).map((book) => (
              <div
                key={book._id}
                className="flex items-center justify-between rounded-lg border border-orange-200 bg-white p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[color:var(--color-foreground)] truncate">
                    {book.title}
                  </p>
                  {book.stock === 0 ? (
                    <p className="text-xs font-semibold text-red-600">
                      نفد المخزون بالكامل — أعد التخزين فوراً
                    </p>
                  ) : (
                    <p className="text-xs text-orange-700">
                      متبقي {book.stock} من {book.lowStockThreshold}
                    </p>
                  )}
                </div>
                <Link
                  href={`/admin/books?edit=${book.slug}`}
                  className="ml-3 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-700 whitespace-nowrap"
                >
                  تحديث
                </Link>
              </div>
            ))}
          </div>
          {books.length > 10 && (
            <div className="mt-4 text-center">
              <Link
                href="/admin/books?filter=low-stock"
                className="text-sm font-semibold text-orange-900 hover:underline"
              >
                عرض جميع الكتب ({books.length})
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}



