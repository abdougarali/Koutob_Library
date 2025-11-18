"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useWishlist } from "@/hooks/useWishlist";

type WishlistButtonProps = {
  bookId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  onStatusChange?: (isInWishlist: boolean) => void;
};

export function WishlistButton({
  bookId,
  className = "",
  size = "md",
  onStatusChange,
}: WishlistButtonProps) {
  const { data: session } = useSession();
  const { getWishlistStatus, updateWishlistStatus, checkBatch } =
    useWishlist();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!session) {
      setIsChecking(false);
      return;
    }

    const cached = getWishlistStatus(bookId);
    if (cached !== undefined) {
      setIsInWishlist(cached);
      setIsChecking(false);
      return;
    }

    checkBatch([bookId]).finally(() => {
      const refreshed = getWishlistStatus(bookId);
      setIsInWishlist(refreshed === true);
      setIsChecking(false);
    });
  }, [session, bookId, getWishlistStatus, checkBatch]);

  // Update local state when wishlist map changes
  useEffect(() => {
    if (session) {
      setIsInWishlist(getWishlistStatus(bookId) === true);
    }
  }, [bookId, getWishlistStatus, session]);

  const handleToggle = async () => {
    if (!session) {
      toast.error("يرجى تسجيل الدخول لإضافة الكتب إلى قائمة الأمنيات");
      return;
    }

    setIsLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(
          `/api/wishlist?bookId=${encodeURIComponent(bookId)}`,
          {
            method: "DELETE",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "فشل في حذف الكتاب");
        }

        setIsInWishlist(false);
        updateWishlistStatus(bookId, false);
        onStatusChange?.(false);
        toast.success("تم حذف الكتاب من قائمة الأمنيات");
      } else {
        // Add to wishlist
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "فشل في إضافة الكتاب");
        }

        setIsInWishlist(true);
        updateWishlistStatus(bookId, true);
        onStatusChange?.(true);
        toast.success("تم إضافة الكتاب إلى قائمة الأمنيات");
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <button
        disabled
        className={`${className} opacity-50 cursor-not-allowed`}
      >
        <svg
          className="w-5 h-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </button>
    );
  }

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${className} ${sizeClasses[size]} flex items-center justify-center rounded-full border-2 transition-colors ${
        isInWishlist
          ? "border-red-500 bg-red-50 text-red-500 hover:bg-red-100"
          : "border-gray-300 bg-white text-gray-400 hover:border-red-500 hover:text-red-500"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isInWishlist ? "إزالة من قائمة الأمنيات" : "إضافة إلى قائمة الأمنيات"}
    >
      {isLoading ? (
        <svg
          className="w-5 h-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg
          className={`${size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6"} ${
            isInWishlist ? "fill-current" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
    </button>
  );
}

