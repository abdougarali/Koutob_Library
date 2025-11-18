"use client";

import { useEffect } from "react";
import { BookCard } from "@/components/cards/BookCard";
import { useWishlist } from "@/hooks/useWishlist";

type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  stock?: number;
  averageRating?: number;
  totalReviews?: number;
};

type BooksListClientProps = {
  books: Book[];
};

export function BooksListClient({ books }: BooksListClientProps) {
  const { checkBatch } = useWishlist();

  // Batch check wishlist status for all books on mount
  useEffect(() => {
    if (books.length > 0) {
      const bookIds = books.map((book) => book.id);
      checkBatch(bookIds);
    }
  }, [books, checkBatch]);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <BookCard key={book.id} {...book} href={`/books/${encodeURIComponent(book.id)}`} />
      ))}
    </div>
  );
}










