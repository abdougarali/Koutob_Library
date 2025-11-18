import { BookCardSkeleton } from "@/components/shared/BookCardSkeleton";

export default function BooksLoading() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-4 text-right">
        <div className="h-5 w-24 rounded bg-gray-200 animate-pulse" />
        <div className="h-9 w-64 rounded bg-gray-200 animate-pulse" />
        <div className="h-5 w-full max-w-md rounded bg-gray-200 animate-pulse" />
      </header>
      
      {/* Search bar skeleton */}
      <div className="h-12 w-full rounded-xl bg-gray-200 animate-pulse" />
      
      {/* Filter bar skeleton */}
      <div className="flex flex-wrap gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-20 rounded-full bg-gray-200 animate-pulse" />
        ))}
      </div>
      
      {/* Books grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
















