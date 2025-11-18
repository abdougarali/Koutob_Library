"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { WishlistButton } from "./WishlistButton";
import { StarRating } from "@/components/reviews/StarRating";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import toast from "react-hot-toast";
import { useWishlist } from "@/hooks/useWishlist";

type WishlistItem = {
  _id: string;
  book: {
    _id: string;
    slug: string;
    title: string;
    author: string;
    category: string;
    price: number;
    salePrice?: number;
    imageUrl: string;
    stock?: number;
  };
  createdAt: string;
};

export function WishlistClient() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { updateWishlistStatus, checkBatch } = useWishlist();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/wishlist");
      const data = await response.json();

      if (response.ok) {
        const items: WishlistItem[] = data.wishlist || [];
        setWishlist(items);

        // Sync wishlist hook cache so buttons render with correct state
        if (items.length > 0) {
          const bookIds = items.map((item) => item.book.slug);
          checkBatch(bookIds).then(() => {
            items.forEach((item) => {
              updateWishlistStatus(item.book.slug, true);
            });
          });
        }
      } else {
        toast.error(data.error || "فشل في جلب قائمة الأمنيات");
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("حدث خطأ أثناء جلب قائمة الأمنيات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (bookSlug: string, isInWishlist: boolean) => {
    if (!isInWishlist) {
      setWishlist((prev) =>
        prev.filter((item) => item.book.slug !== bookSlug),
      );
      updateWishlistStatus(bookSlug, false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-gray-600">جاري تحميل قائمة الأمنيات...</p>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          قائمة الأمنيات فارغة
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          لم تقم بإضافة أي كتب إلى قائمة الأمنيات بعد
        </p>
        <Link
          href="/books"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90"
        >
          تصفح الكتب
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">قائمة الأمنيات</h1>
          <p className="mt-1 text-sm text-gray-600">
            {wishlist.length} {wishlist.length === 1 ? "كتاب" : "كتاب"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlist.map((item) => {
          const book = item.book;
          const hasDiscount = book.salePrice && book.salePrice > 0 && book.salePrice < book.price;
          const displayPrice = hasDiscount && book.salePrice ? book.salePrice : book.price;

          return (
            <div
              key={item._id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative">
                <Link href={`/books/${book.slug}`}>
                  <div className="relative h-48 w-full overflow-hidden rounded-xl bg-gray-100">
                    <Image
                      src={book.imageUrl}
                      alt={book.title}
                      fill
                      className="object-cover object-center transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </Link>
                <div className="absolute top-2 left-2">
                  <WishlistButton
                    bookId={book.slug}
                    size="sm"
                    onStatusChange={(status) =>
                      handleStatusChange(book.slug, status)
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div>
                  <span className="text-xs font-medium text-primary">
                    {book.category}
                  </span>
                  <Link href={`/books/${book.slug}`}>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900 line-clamp-2 hover:text-primary">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600">{book.author}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {hasDiscount ? (
                      <>
                        <span className="text-base font-bold text-primary">
                          {displayPrice.toLocaleString("ar-TN", {
                            style: "currency",
                            currency: "TND",
                            maximumFractionDigits: 3,
                          })}
                        </span>
                        <span className="text-xs text-gray-500 line-through">
                          {book.price.toLocaleString("ar-TN", {
                            style: "currency",
                            currency: "TND",
                            maximumFractionDigits: 3,
                          })}
                        </span>
                      </>
                    ) : (
                      <span className="text-base font-bold text-gray-900">
                        {displayPrice.toLocaleString("ar-TN", {
                          style: "currency",
                          currency: "TND",
                          maximumFractionDigits: 3,
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <AddToCartButton
                  book={{
                    id: book.slug,
                    title: book.title,
                    price: displayPrice,
                    imageUrl: book.imageUrl,
                    stock: book.stock ?? 0,
                  }}
                  className="w-full px-4 py-2 text-sm"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

