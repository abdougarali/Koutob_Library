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

  const stock = book.stock ?? 0;
  const currentQuantity = items.find((item) => item.id === book.id)?.quantity ?? 0;
  const availableStock = stock - currentQuantity;
  const isOutOfStock = stock <= 0;
  const cannotAddMore = availableStock <= 0;

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
        className={`min-h-[44px] rounded-full bg-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-600 cursor-not-allowed sm:px-5 sm:py-2 sm:text-sm ${className || ""}`}
      >
        غير متوفر
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isAdding || cannotAddMore}
      className={`min-h-[44px] rounded-full bg-[color:var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-[color:var(--color-primary-foreground)] transition active:opacity-80 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed sm:px-5 sm:py-2 sm:text-sm ${className || ""}`}
    >
      {isAdding ? "جاري الإضافة..." : cannotAddMore ? "الكمية المتاحة محدودة" : "أضف إلى السلة"}
    </button>
  );
}

