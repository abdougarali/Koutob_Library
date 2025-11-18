"use client";

import { useEffect } from "react";
import { useViewedBooksStore } from "@/lib/stores/viewedBooksStore";

type BookViewTrackerProps = {
  book: {
    id: string;
    slug: string;
    title: string;
    author: string;
    category: string;
    price: number;
    salePrice?: number;
    imageUrl: string;
    stock: number;
  };
};

export function BookViewTracker({ book }: BookViewTrackerProps) {
  const addBook = useViewedBooksStore((state) => state.addBook);

  useEffect(() => {
    // Track book view when component mounts
    addBook({
      id: book.id,
      slug: book.slug,
      title: book.title,
      author: book.author,
      category: book.category,
      price: book.price,
      salePrice: book.salePrice,
      imageUrl: book.imageUrl,
      stock: book.stock,
    });
  }, [book, addBook]);

  return null; // This component doesn't render anything
}





