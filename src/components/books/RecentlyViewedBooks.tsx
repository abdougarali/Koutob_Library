"use client";

import { useEffect, useState } from "react";
import { useViewedBooksStore } from "@/lib/stores/viewedBooksStore";
import { BookCard } from "@/components/cards/BookCard";

export function RecentlyViewedBooks() {
  const getRecentBooks = useViewedBooksStore((state) => state.getRecentBooks);
  const [books, setBooks] = useState<ReturnType<typeof getRecentBooks>>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Wait for hydration to avoid SSR mismatch
    setHydrated(true);
    const recent = getRecentBooks(8);
    setBooks(recent);
  }, [getRecentBooks]);

  if (!hydrated || books.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-4 px-4 py-8 sm:space-y-6 sm:px-6 sm:py-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[color:var(--color-foreground)] sm:text-2xl">
          شاهدتها مؤخراً
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {books.map((book) => (
          <BookCard
            key={book.slug}
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





