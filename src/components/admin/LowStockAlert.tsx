"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

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
      <div className="rounded-xl border border-orange-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="h-4 w-4 animate-pulse text-orange-500" />
          <span className="text-xs font-medium text-gray-600">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  const outOfStockCount = books.filter((b) => b.stock === 0).length;
  const lowStockCount = books.length - outOfStockCount;

  return (
    <div className="rounded-xl border border-orange-200 bg-white p-4 shadow-sm">
      {/* Compact Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
            <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">تنبيهات المخزون</h3>
          {books.length > 0 && (
            <span className="rounded-full bg-orange-600 px-2 py-0.5 text-xs font-bold text-white">
              {books.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => fetchLowStockBooks(false)}
          disabled={refreshing}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          title="تحديث"
        >
          <ArrowPathIcon
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Compact Stats Bar */}
      {books.length > 0 && (
        <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
          {outOfStockCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-red-600">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
              {outOfStockCount} نفد
            </span>
          )}
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-orange-600">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-600"></span>
              {lowStockCount} منخفض
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {books.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3">
          <BookOpenIcon className="h-4 w-4 text-green-600" />
          <p className="text-xs font-medium text-green-700">
            لا توجد تنبيهات مخزون
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-72 overflow-y-auto">
          {books.slice(0, 8).map((book) => (
            <Link
              key={book._id}
              href={`/admin/books?edit=${book.slug}`}
              className="group flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 transition hover:border-orange-300 hover:bg-orange-50"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded ${
                    book.stock === 0 ? "bg-red-100" : "bg-orange-100"
                  }`}
                >
                  <BookOpenIcon
                    className={`h-3.5 w-3.5 ${
                      book.stock === 0 ? "text-red-600" : "text-orange-600"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {book.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    {book.stock === 0 ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                        <ExclamationTriangleIcon className="h-3 w-3" />
                        نفد
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-gray-600">
                        متبقي <span className="font-bold text-orange-600">{book.stock}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-medium text-gray-400 group-hover:text-orange-600">
                →
              </span>
            </Link>
          ))}
          {books.length > 8 && (
            <Link
              href="/admin/books?filter=low-stock"
              className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-2 text-xs font-medium text-gray-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
            >
              <span>عرض جميع الكتب</span>
              <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold">
                {books.length}
              </span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}



