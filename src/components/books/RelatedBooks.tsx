"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookCard } from "@/components/cards/BookCard";

type RelatedBook = {
  _id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  stock: number;
};

type RelatedBooksProps = {
  bookSlug: string;
  category: string;
  author: string;
  limit?: number;
};

export function RelatedBooks({
  bookSlug,
  category,
  author,
  limit = 3,
}: RelatedBooksProps) {
  const [books, setBooks] = useState<RelatedBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedBooks() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/books/${encodeURIComponent(bookSlug)}/related?limit=${limit}`,
        );
        if (response.ok) {
          const data = await response.json();
          setBooks(data.books || []);
        }
      } catch (error) {
        console.error("Error fetching related books:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedBooks();
  }, [bookSlug, limit]);

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-5xl space-y-4 px-4 sm:space-y-6 sm:px-6">
        <h2 className="text-xl font-bold text-[color:var(--color-foreground)] sm:text-2xl">
          قد يعجبك أيضاً
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl bg-gray-200"
            />
          ))}
        </div>
      </section>
    );
  }

  if (books.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-4 px-4 sm:space-y-6 sm:px-6">
      <h2 className="text-xl font-bold text-[color:var(--color-foreground)] sm:text-2xl">
        قد يعجبك أيضاً
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {books.map((book) => (
          <BookCard
            key={book._id}
            id={book.slug}
            title={book.title}
            author={book.author}
            category={book.category}
            price={book.price}
            salePrice={book.salePrice}
            imageUrl={book.imageUrl}
            href={`/books/${encodeURIComponent(book.slug)}`}
            stock={book.stock}
          />
        ))}
      </div>
    </section>
  );
}









