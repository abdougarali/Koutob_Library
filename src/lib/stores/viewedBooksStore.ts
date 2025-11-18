"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ViewedBook = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  stock: number;
  viewedAt: number; // timestamp
};

type ViewedBooksState = {
  books: ViewedBook[];
  addBook: (book: Omit<ViewedBook, "viewedAt">) => void;
  getRecentBooks: (limit?: number) => ViewedBook[];
  clearHistory: () => void;
};

const STORAGE_KEY = "koutob-viewed-books";
const MAX_BOOKS = 20; // Keep last 20 viewed books

export const useViewedBooksStore = create<ViewedBooksState>()(
  persist(
    (set, get) => ({
      books: [],
      addBook: (book) => {
        const existingBooks = get().books;
        // Remove if already exists (to avoid duplicates)
        const filtered = existingBooks.filter((b) => b.slug !== book.slug);
        // Add new book at the beginning
        const updated = [
          { ...book, viewedAt: Date.now() },
          ...filtered,
        ].slice(0, MAX_BOOKS); // Keep only last MAX_BOOKS

        set({ books: updated });
      },
      getRecentBooks: (limit = 10) => {
        const books = get().books;
        // Sort by viewedAt (most recent first) and limit
        return books
          .sort((a, b) => b.viewedAt - a.viewedAt)
          .slice(0, limit);
      },
      clearHistory: () => set({ books: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);





