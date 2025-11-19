import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { featuredBooks } from "@/data/featured-books";
import { getBookBySlug } from "@/lib/services/bookService";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { BookImageGallery } from "@/components/books/BookImageGallery";
import { RelatedBooks } from "@/components/books/RelatedBooks";
import { BookViewTracker } from "@/components/books/BookViewTracker";
import { getBookRatingStats } from "@/lib/services/reviewService";

type BookPageProps = {
  params: Promise<{ id: string }>;
};

async function loadBook(slug: string) {
  try {
    const dbBook = await getBookBySlug(slug);
    if (dbBook) {
      return {
        id: dbBook.slug,
        title: dbBook.title,
        author: dbBook.author,
        category: dbBook.category ?? "غير مصنف",
        description: dbBook.description,
        price: dbBook.salePrice ?? dbBook.price ?? 0,
        imageUrl: dbBook.imageUrl,
        images: Array.isArray((dbBook as any).images)
          ? (dbBook as any).images
              .filter((img: any) => img?.url)
              .map((img: any) => ({ url: img.url as string, isPrimary: !!img.isPrimary }))
          : [],
        stock: dbBook.stock ?? 0,
      };
    }
  } catch (error) {
    console.warn("BookDetailsPage fallback to static data", error);
  }

  const fallbackBook = featuredBooks.find((item) => item.id === slug);
  return fallbackBook ? { ...fallbackBook, stock: 0 } : undefined;
}

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const book = await loadBook(decodedId);

  const title = book
    ? `${book.title} | مكتبة كتب الإسلامية`
    : "الكتاب غير موجود | مكتبة كتب الإسلامية";
  const description = book
    ? `تفاصيل الكتاب "${book.title}" من تأليف ${book.author}.`
    : "الكتاب المطلوب غير متوفر حالياً.";
  const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/books/${encodeURIComponent(decodedId)}`;
  const image = book?.imageUrl ?? `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/default-og.png`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function BookDetailsPage({ params }: BookPageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const book = await loadBook(decodedId);
  const ratingStats = await getBookRatingStats(decodedId).catch(() => ({
    averageRating: 0,
    totalReviews: 0,
  }));

  if (!book) {
    notFound();
  }

  return (
    <div className="bg-gray-50 py-8 sm:py-12 lg:py-16">
      <BookViewTracker
        book={{
          id: book.id,
          slug: book.id,
          title: book.title,
          author: book.author,
          category: book.category,
          price: book.price,
          imageUrl: book.imageUrl,
          stock: book.stock,
        }}
      />
      <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-2xl bg-white px-4 py-8 shadow-sm sm:gap-8 sm:rounded-3xl sm:px-6 sm:py-12 lg:flex-row lg:gap-10 lg:px-12">
        <div className="w-full lg:max-w-sm">
          <div className="relative">
            <BookImageGallery
              title={book.title}
              images={book.images}
              fallbackImageUrl={book.imageUrl}
            />
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
              <WishlistButton bookId={book.id} size="md" />
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-[color:var(--color-primary)] sm:text-sm">
              {book.category}
            </span>
            <h1 className="text-2xl font-bold text-[color:var(--color-foreground)] sm:text-3xl lg:text-4xl">
              {book.title}
            </h1>
            <p className="text-sm text-[color:var(--color-foreground-muted)] sm:text-base">
              تأليف {book.author}
            </p>
          </div>
          <p className="rounded-2xl bg-[color:var(--color-surface-muted)] p-4 text-xs leading-7 text-[color:var(--color-foreground-muted)] sm:rounded-3xl sm:p-6 sm:text-sm sm:leading-8">
            {book.description ??
              "الوصف التفصيلي للكتاب سيظهر هنا بمجرد إضافته في لوحة الإدارة."}
          </p>
          <div className="flex flex-col gap-3 sm:gap-4">
            <span className="text-xl font-bold text-[color:var(--color-foreground)] sm:text-2xl">
              {book.price.toLocaleString("ar-TN", {
                style: "currency",
                currency: "TND",
                maximumFractionDigits: 3,
              })}
            </span>
            <AddToCartButton
              book={{
                id: book.id,
                title: book.title,
                price: book.price,
                imageUrl: book.imageUrl,
                stock: book.stock ?? 0,
              }}
            />
          </div>
        </div>
      </article>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: book.title,
            image: [book.imageUrl],
            description: book.description || "",
            brand: book.author ? { "@type": "Brand", name: book.author } : undefined,
            offers: {
              "@type": "Offer",
              priceCurrency: "TND",
              price: Number(book.price).toFixed(3),
              availability: (book.stock ?? 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              url: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/books/${encodeURIComponent(decodedId)}`,
            },
            aggregateRating:
              ratingStats && ratingStats.totalReviews > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: ratingStats.averageRating,
                    reviewCount: ratingStats.totalReviews,
                  }
                : undefined,
          }),
        }}
      />

      {/* Reviews Section */}
      <div className="mx-auto mt-6 w-full max-w-5xl space-y-4 px-4 sm:mt-10 sm:space-y-6 sm:px-6">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">التقييمات والمراجعات</h2>
        <ReviewsList bookSlug={book.id} />
        <ReviewForm bookSlug={book.id} />
      </div>

      {/* Related Books Section */}
      <RelatedBooks
        bookSlug={book.id}
        category={book.category}
        author={book.author}
        limit={3}
      />
    </div>
  );
}

