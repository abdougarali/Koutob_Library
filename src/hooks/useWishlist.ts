"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";

type WishlistMap = Record<string, boolean>;

/**
 * Hook to manage wishlist state with caching
 * Provides batch checking and caching to avoid multiple API calls
 */
export function useWishlist() {
  const { data: session } = useSession();
  const [wishlistMap, setWishlistMap] = useState<WishlistMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [checkedBooks, setCheckedBooks] = useState<Set<string>>(new Set());

  // Check multiple books at once (batch)
  const checkBatch = useCallback(
    async (bookIds: string[]) => {
      if (!session || bookIds.length === 0) {
        return;
      }

      // Filter out already checked books
      const uncheckedIds = bookIds.filter((id) => !checkedBooks.has(id));

      if (uncheckedIds.length === 0) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/wishlist/batch?bookIds=${uncheckedIds.join(",")}`,
        );
        const data = await response.json();

        if (response.ok && data.wishlistMap) {
          setWishlistMap((prev) => ({
            ...prev,
            ...data.wishlistMap,
          }));
          setCheckedBooks((prev) => {
            const newSet = new Set(prev);
            uncheckedIds.forEach((id) => newSet.add(id));
            return newSet;
          });
        }
      } catch (error) {
        console.error("Error checking batch wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [session, checkedBooks],
  );

  // Get cached status for a single book (undefined if not checked yet)
  const getWishlistStatus = useCallback(
    (bookId: string): boolean | undefined => {
      if (Object.prototype.hasOwnProperty.call(wishlistMap, bookId)) {
        return wishlistMap[bookId];
      }
      return undefined;
    },
    [wishlistMap],
  );

  const isInWishlist = useCallback(
    (bookId: string): boolean => getWishlistStatus(bookId) === true,
    [getWishlistStatus],
  );

  // Update wishlist status for a book (after add/remove)
  const updateWishlistStatus = useCallback(
    (bookId: string, status: boolean) => {
      setWishlistMap((prev) => ({
        ...prev,
        [bookId]: status,
      }));
      setCheckedBooks((prev) => {
        const newSet = new Set(prev);
        newSet.add(bookId);
        return newSet;
      });
    },
    [],
  );

  // Clear cache (useful after logout or when needed)
  const clearCache = useCallback(() => {
    setWishlistMap({});
    setCheckedBooks(new Set());
  }, []);

  return {
    wishlistMap,
    getWishlistStatus,
    isInWishlist,
    checkBatch,
    updateWishlistStatus,
    clearCache,
    isLoading,
  };
}
