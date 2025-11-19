import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BookCard } from "@/components/cards/BookCard";
import { RecentlyViewedBooks } from "@/components/books/RecentlyViewedBooks";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import {
  getPublishedBooks,
  getBookCategories,
} from "@/lib/services/bookService";
import { featuredBooks as fallbackBooks } from "@/data/featured-books";
import { bookCategories as fallbackCategories } from "@/data/categories";

export const metadata: Metadata = {
  title: "مكتبة كتب الإسلامية | Koutob",
  description:
    "متجر إلكتروني متخصص في الكتب الإسلامية مع خدمة التوصيل المحلي والدفع عند الاستلام.",
};

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

export default async function HomePage() {
  const [booksFromDb, categoriesFromDb] = await Promise.all([
    getPublishedBooks({ isFeatured: true }),
    getBookCategories(),
  ]);

  const featuredBooksList =
    booksFromDb.length > 0
      ? booksFromDb.slice(0, 6).map((book) => ({
          id: book.slug,
          title: book.title,
          author: book.author,
          category: book.category ?? "غير مصنف",
          price: book.price ?? 0,
          salePrice: book.salePrice,
          imageUrl: book.imageUrl,
          stock: book.stock,
        }))
      : fallbackBooks;

  const categories =
    categoriesFromDb.length > 0 ? categoriesFromDb : fallbackCategories;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[rgba(10,110,92,0.05)] to-[rgba(184,138,68,0.05)] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 text-center sm:gap-8 sm:px-6 lg:flex-row lg:text-right">
          <div className="flex-1 w-full">
            <h1 className="mb-3 text-3xl font-bold text-[color:var(--color-foreground)] sm:text-4xl sm:mb-4 md:text-5xl lg:text-6xl">
              مكتبة كتب الإسلامية
            </h1>
            <p className="mb-4 text-base text-[color:var(--color-foreground-muted)] sm:mb-6 sm:text-lg">
              اكتشف مجموعتنا المختارة من الكتب الإسلامية الموثوقة في مختلف
              العلوم الشرعية
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              <Link
                href="/books"
                className="rounded-full bg-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition hover:opacity-90 sm:px-6 sm:py-3 sm:text-base"
              >
                تصفح المكتبة
              </Link>
              <Link
                href="/orders/track"
                className="rounded-full border border-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[color:var(--color-primary)] transition hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-primary-foreground)] sm:px-6 sm:py-3 sm:text-base"
              >
                تتبع طلبك
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="relative h-48 w-full sm:h-64 md:h-80 lg:h-96">
              <Image
                src="/assets/images/hero-books.svg"
                alt="كتب إسلامية"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:gap-8 sm:px-6 sm:py-16">
        <header className="flex flex-col gap-2 text-right sm:gap-3">
          <p className="text-xs font-semibold text-[color:var(--color-primary)] sm:text-sm">
            الأقسام
          </p>
          <h2 className="text-2xl font-bold text-[color:var(--color-foreground)] sm:text-3xl">
            تصفح حسب التصنيف
          </h2>
        </header>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:justify-start">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/books?category=${encodeURIComponent(category)}`}
              className="group flex items-center gap-2 rounded-full border border-[rgba(10,110,92,0.2)] bg-white px-4 py-2 text-xs font-semibold text-[color:var(--color-primary)] transition hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-primary-foreground)] sm:px-6 sm:py-3 sm:text-sm"
            >
              <span>{category}</span>
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="bg-[color:var(--color-surface-muted)] py-12 sm:py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:gap-10 sm:px-6">
          <header className="flex flex-col gap-3 text-right sm:gap-4">
            <p className="text-xs font-semibold text-[color:var(--color-primary)] sm:text-sm">
              كتب مختارة
            </p>
            <h2 className="text-2xl font-bold text-[color:var(--color-foreground)] sm:text-3xl">
              اكتشف مجموعتنا المميزة
            </h2>
            <p className="text-sm text-[color:var(--color-foreground-muted)] sm:text-base">
              مجموعة مختارة بعناية من أفضل الكتب الإسلامية في مختلف العلوم
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {featuredBooksList.map((book) => (
              <BookCard
                key={book.id}
                {...book}
                href={`/books/${encodeURIComponent(book.id)}`}
              />
            ))}
          </div>
          <div className="flex justify-center">
            <Link
              href="/books"
              className="rounded-full border border-[color:var(--color-primary)] px-6 py-3 text-base font-semibold text-[color:var(--color-primary)] transition hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-primary-foreground)]"
            >
              عرض جميع الكتب
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Viewed Books Section */}
      <RecentlyViewedBooks />

      {/* Features Section */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            <div className="flex flex-col gap-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(10,110,92,0.12)]">
                <svg
                  className="h-8 w-8 text-[color:var(--color-primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">
                كتب موثوقة
              </h3>
              <p className="text-sm text-[color:var(--color-foreground-muted)]">
                نختار كتبنا بعناية من مصادر موثوقة
              </p>
            </div>
            <div className="flex flex-col gap-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(10,110,92,0.12)]">
                <svg
                  className="h-8 w-8 text-[color:var(--color-primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">
                دفع عند الاستلام
              </h3>
              <p className="text-sm text-[color:var(--color-foreground-muted)]">
                ادفع نقداً عند استلام طلبك
              </p>
            </div>
            <div className="flex flex-col gap-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(10,110,92,0.12)]">
                <svg
                  className="h-8 w-8 text-[color:var(--color-primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">
                توصيل سريع
              </h3>
              <p className="text-sm text-[color:var(--color-foreground-muted)]">
                توصيل محلي مع متابعة مستمرة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Partners Section */}
      <section className="bg-[color:var(--color-surface-muted)] py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <header className="mb-6 flex flex-col gap-2 text-center sm:mb-8 sm:gap-3">
            <h2 className="text-xl font-bold text-[color:var(--color-foreground)] sm:text-2xl">
              شركاء التوصيل
            </h2>
            <p className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
              نتعاون مع أفضل شركات التوصيل المحلية لضمان وصول طلبك بأمان
            </p>
          </header>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex h-20 w-32 items-center justify-center rounded-2xl bg-white shadow-sm"
              >
                <span className="text-xs text-[color:var(--color-foreground-muted)]">
                  شريك {i}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
          <NewsletterSignup className="bg-gradient-to-br from-[rgba(10,110,92,0.05)] to-[rgba(184,138,68,0.05)]" />
        </div>
      </section>
    </div>
  );
}
