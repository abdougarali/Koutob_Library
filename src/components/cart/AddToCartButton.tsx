"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useCartStore } from "@/lib/stores/cartStore";

type AddToCartButtonProps = {
  book: {
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
    stock?: number;
  };
  className?: string;
};

export function AddToCartButton({
  book,
  className,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  // If stock is undefined, treat it as available (unlimited stock)
  // Only show "out of stock" if stock is explicitly 0 or less
  const stock = book.stock;
  const currentQuantity = items.find((item) => item.id === book.id)?.quantity ?? 0;
  const availableStock = stock !== undefined ? stock - currentQuantity : Infinity;
  const isOutOfStock = stock !== undefined && stock <= 0;
  const cannotAddMore = stock !== undefined && availableStock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error("هذا الكتاب غير متوفر حالياً");
      return;
    }

    if (cannotAddMore) {
      toast.error(`لا يمكن إضافة المزيد. الكمية المتاحة: ${stock}`);
      return;
    }

    setIsAdding(true);
    try {
      addItem({
        id: book.id,
        title: book.title,
        price: book.price,
        imageUrl: book.imageUrl,
      });
      toast.success("تمت الإضافة إلى السلة");
    } catch (error) {
      toast.error("حدث خطأ أثناء الإضافة");
    } finally {
      setIsAdding(false);
    }
  };

  if (isOutOfStock) {
    return (
      <button
        type="button"
        disabled
        className={`flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-gray-300 px-2.5 py-1.5 text-[10px] font-semibold text-gray-600 cursor-not-allowed sm:min-h-[40px] sm:min-w-[40px] sm:px-3 sm:py-2 sm:text-xs md:min-h-[44px] md:px-4 md:py-2.5 md:text-sm ${className || ""}`}
      >
        <span className="hidden sm:inline">غير متوفر</span>
        <span className="sm:hidden">نفد</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isAdding || cannotAddMore}
      className={`flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-2.5 py-1.5 text-[10px] font-semibold text-[color:var(--color-primary-foreground)] transition active:opacity-80 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed sm:min-h-[40px] sm:min-w-[40px] sm:px-3 sm:py-2 sm:text-xs md:min-h-[44px] md:px-4 md:py-2.5 md:text-sm ${className || ""}`}
    >
      <span className="hidden sm:inline">
        {isAdding ? "جاري الإضافة..." : cannotAddMore ? "الكمية المتاحة محدودة" : "أضف إلى السلة"}
      </span>
      <span className="sm:hidden">
        {isAdding ? "..." : cannotAddMore ? "محدود" : "أضف"}
      </span>
    </button>
  );
}

