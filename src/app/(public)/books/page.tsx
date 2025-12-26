import type { Metadata } from "next";
import { FilterBar } from "@/components/shared/FilterBar";
import { SearchBar } from "@/components/shared/SearchBar";
import { Pagination } from "@/components/shared/Pagination";
import { BooksListClient } from "@/components/books/BooksListClient";
import { AdvancedFilters } from "@/components/shared/AdvancedFilters";
import {
  getBookCategories,
  getPublishedBooks,
  getPublishedBooksCount,
  type SortOption,
  type BookFilters,
} from "@/lib/services/bookService";
import { getBooksRatingStats } from "@/lib/services/reviewService";
import { bookCategories as fallbackCategories } from "@/data/categories";
import { featuredBooks as fallbackBooks } from "@/data/featured-books";

export const metadata: Metadata = {
  title: "جميع الكتب | مكتبة الفاروق",
  description:
    "تصفّح مجموعتنا المختارة من الكتب الإسلامية التي تغطي الفقه، الحديث، التفسير، السيرة، والعقيدة.",
};

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

type BooksPageProps = {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    format?: string;
    sort?: string;
    author?: string;
  }>;
};

const BOOKS_PER_PAGE = 12;

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const { category, search, page, minPrice, maxPrice, format, sort, author } = await searchParams;
  const currentPage = page ? Math.max(1, parseInt(page, 10)) : 1;
  const skip = (currentPage - 1) * BOOKS_PER_PAGE;

  // Parse filters
  const bookFilters: BookFilters = {
    category: category || undefined,
    format: format === "hardcover" || format === "paperback" ? format : undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    author: author || undefined,
  };

  const sortOption: SortOption = 
    sort === "newest" || sort === "oldest" || sort === "price-low" || 
    sort === "price-high" || sort === "title-asc" || sort === "title-desc"
      ? sort
      : "newest";

  const [categoriesFromDb, booksFromDb, totalCount] = await Promise.all([
    getBookCategories(),
    getPublishedBooks(
      category
        ? {
            category,
          }
        : undefined,
      search,
      {
        limit: BOOKS_PER_PAGE,
        skip,
        sort: sortOption,
        bookFilters,
      },
    ),
    getPublishedBooksCount(
      category
        ? {
            category,
          }
        : undefined,
      search,
      bookFilters,
    ),
  ]);

  const totalPages = Math.ceil(totalCount / BOOKS_PER_PAGE);

  const categories =
    categoriesFromDb.length > 0 ? categoriesFromDb : fallbackCategories;

  // Only use fallback books if there are no books in database and no filters/search applied
  const useFallback = totalCount === 0 && !category && !search;
  
  // Get rating stats for all books (batch query)
  const bookIds = useFallback 
    ? fallbackBooks.map((book) => book.id)
    : booksFromDb.map((book) => book._id?.toString() || book.slug);
  
  const ratingStatsMap = await getBooksRatingStats(bookIds);
  
  const books = useFallback
    ? fallbackBooks.map((book) => ({ ...book, stock: 0 }))
    : booksFromDb.map((book) => {
        const bookId = book._id?.toString() || book.slug;
        const ratingStats = ratingStatsMap.get(bookId);
        
        return {
          id: book.slug,
          title: book.title,
          author: book.author,
          category: book.category ?? "غير مصنف",
          price: book.price ?? 0,
          salePrice: book.salePrice,
          imageUrl: book.imageUrl,
          stock: book.stock ?? 0,
          averageRating: ratingStats?.averageRating || 0,
          totalReviews: ratingStats?.totalReviews || 0,
        };
      });

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:gap-8 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-3 text-right sm:gap-4">
        <p className="text-xs font-semibold text-[color:var(--color-primary)] sm:text-sm">
          جميع الكتب
        </p>
        <h1 className="text-2xl font-bold text-[color:var(--color-foreground)] sm:text-3xl">
          اكتشف مجموعة الكتب المختارة بعناية
        </h1>
        <p className="text-sm text-[color:var(--color-foreground-muted)] sm:text-base">
          نوفر لك كتباً موثوقة في مختلف العلوم الإسلامية مع تحديث دائم للمخزون
          والعناوين الجديدة.
        </p>
      </header>
      <div className="flex flex-col gap-4">
        <SearchBar basePath="/books" />
        <FilterBar
          categories={categories}
          selectedCategory={category}
          basePath="/books"
        />
        <AdvancedFilters
          basePath="/books"
          initialFilters={{
            minPrice: minPrice,
            maxPrice: maxPrice,
            format: format,
            sort: sort || "newest",
            author: author,
          }}
        />
      </div>
      {search && (
        <div className="rounded-xl bg-[color:var(--color-surface-muted)] px-4 py-2 text-sm text-[color:var(--color-foreground-muted)]">
          نتائج البحث عن: <span className="font-semibold text-[color:var(--color-foreground)]">{search}</span>
        </div>
      )}
      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-[color:var(--color-surface-muted)] py-16 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-16 w-16 text-[color:var(--color-foreground-muted)]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
          <p className="text-lg font-semibold text-[color:var(--color-foreground)]">
            {search ? "لم يتم العثور على نتائج" : "لا توجد كتب متاحة حالياً"}
          </p>
          <p className="text-sm text-[color:var(--color-foreground-muted)]">
            {search
              ? "جرب البحث بكلمات مختلفة أو تحقق من الإملاء"
              : "سيتم إضافة كتب جديدة قريباً"}
          </p>
        </div>
      ) : (
        <>
          <BooksListClient books={books} />
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/books"
              />
              <p className="text-sm text-[color:var(--color-foreground-muted)]">
                عرض {skip + 1} - {Math.min(skip + BOOKS_PER_PAGE, totalCount)} من أصل {totalCount} كتاب
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}




