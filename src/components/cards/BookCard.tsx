"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { StarRating } from "@/components/reviews/StarRating";
import { WishlistButton } from "@/components/wishlist/WishlistButton";

type BookCardProps = {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  href?: string;
  showAction?: boolean;
  stock?: number;
  averageRating?: number;
  totalReviews?: number;
};

function BookCardComponent({
  id,
  title,
  author,
  category,
  price,
  salePrice,
  imageUrl,
  href = "#",
  showAction = true,
  stock,
  averageRating,
  totalReviews,
}: BookCardProps) {
  const isPlaceholder = imageUrl.includes("via.placeholder.com");
  const hasDiscount = salePrice && salePrice > 0 && salePrice < price;
  const displayPrice = hasDiscount ? salePrice : price;
  const isLowStock = stock !== undefined && stock > 0 && stock <= 10;

  return (
    <div className="flex h-full flex-col gap-2 rounded-xl border border-[rgba(184,138,68,0.16)] bg-white p-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] sm:gap-3 sm:rounded-2xl sm:p-4">
      <div className="relative flex flex-1 flex-col">
        <Link href={href} className="group flex flex-1 flex-col gap-2 sm:gap-3">
          <div className="relative h-40 w-full overflow-hidden rounded-lg bg-[color:var(--color-surface-muted)] sm:h-48 sm:rounded-xl">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              unoptimized={isPlaceholder}
              loading="lazy"
            />
            {isLowStock && (
              <div className="absolute bottom-2 right-2 rounded-full bg-orange-500 px-2 py-1 text-[10px] font-semibold text-white shadow-md sm:px-3 sm:text-xs">
                متبقي {stock} فقط
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-[color:var(--color-primary)]">
              {category}
            </span>
            <h3 className="text-base font-semibold text-[color:var(--color-foreground)] line-clamp-2 sm:text-lg">
              {title}
            </h3>
            <p className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
              {author}
            </p>
            {averageRating && averageRating > 0 && (
              <div className="mt-1 flex items-center gap-2">
                <StarRating rating={averageRating} size="sm" />
                <span className="text-xs text-gray-600">
                  ({totalReviews || 0})
                </span>
              </div>
            )}
          </div>
        </Link>
        <div className="absolute top-2 left-2">
          <WishlistButton bookId={id} size="sm" />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {hasDiscount ? (
            <>
              <span className="text-sm font-bold text-[color:var(--color-primary)] sm:text-base">
                {displayPrice.toLocaleString("ar-TN", {
                  style: "currency",
                  currency: "TND",
                  maximumFractionDigits: 3,
                })}
              </span>
              <span className="text-[10px] text-[color:var(--color-foreground-muted)] line-through sm:text-xs">
                {price.toLocaleString("ar-TN", {
                  style: "currency",
                  currency: "TND",
                  maximumFractionDigits: 3,
                })}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-[color:var(--color-foreground)] sm:text-base">
              {displayPrice.toLocaleString("ar-TN", {
                style: "currency",
                currency: "TND",
                maximumFractionDigits: 3,
              })}
            </span>
          )}
        </div>
        {showAction && (
          <AddToCartButton
            book={{
              id,
              title,
              price: displayPrice,
              imageUrl,
              stock,
            }}
            className="flex-shrink-0"
          />
        )}
      </div>
    </div>
  );
}

// Memoize BookCard to prevent unnecessary re-renders
export const BookCard = memo(BookCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.author === nextProps.author &&
    prevProps.category === nextProps.category &&
    prevProps.price === nextProps.price &&
    prevProps.salePrice === nextProps.salePrice &&
    prevProps.imageUrl === nextProps.imageUrl &&
    prevProps.href === nextProps.href &&
    prevProps.showAction === nextProps.showAction &&
    prevProps.stock === nextProps.stock &&
    prevProps.averageRating === nextProps.averageRating &&
    prevProps.totalReviews === nextProps.totalReviews
  );
});

BookCard.displayName = "BookCard";

