import { dbConnect } from "@/lib/dbConnect";
import { BookModel, type BookDocument } from "@/lib/models/Book";

export type RelatedBook = {
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

/**
 * Get books by the same category (excluding the current book)
 */
async function getBooksByCategory(
  category: string,
  excludeSlug: string,
  limit: number = 4,
): Promise<RelatedBook[]> {
  await dbConnect();

  const books = await BookModel.find({
    category,
    slug: { $ne: excludeSlug },
    status: "published",
    stock: { $gt: 0 }, // Only in-stock books
  })
    .select("slug title author category price salePrice imageUrl stock")
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  return books.map((book) => ({
    _id: book._id?.toString() || "",
    slug: book.slug,
    title: book.title,
    author: book.author,
    category: book.category || "",
    price: book.price,
    salePrice: book.salePrice,
    imageUrl: book.imageUrl,
    stock: book.stock ?? 0,
  }));
}

/**
 * Get books by the same author (excluding the current book)
 */
async function getBooksByAuthor(
  author: string,
  excludeSlug: string,
  limit: number = 4,
): Promise<RelatedBook[]> {
  await dbConnect();

  const books = await BookModel.find({
    author: { $regex: author.trim(), $options: "i" },
    slug: { $ne: excludeSlug },
    status: "published",
  })
    .select("slug title author category price salePrice imageUrl stock")
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  return books.map((book) => ({
    _id: book._id?.toString() || "",
    slug: book.slug,
    title: book.title,
    author: book.author,
    category: book.category || "",
    price: book.price,
    salePrice: book.salePrice,
    imageUrl: book.imageUrl,
    stock: book.stock ?? 0,
  }));
}

/**
 * Get related books for a given book
 * Combines books from same category and same author, removes duplicates
 * @param bookSlug - Slug of the current book
 * @param category - Category of the current book
 * @param author - Author of the current book
 * @param limit - Maximum number of recommendations (default: 6)
 */
export async function getRelatedBooks(
  bookSlug: string,
  category: string,
  author: string,
  limit: number = 6,
): Promise<RelatedBook[]> {
  // Get books from same category and same author in parallel
  const [categoryBooks, authorBooks] = await Promise.all([
    getBooksByCategory(category, bookSlug, Math.ceil(limit / 2)),
    getBooksByAuthor(author, bookSlug, Math.ceil(limit / 2)),
  ]);

  // Combine and deduplicate by slug
  const bookMap = new Map<string, RelatedBook>();

  // Add category books first (higher priority)
  for (const book of categoryBooks) {
    if (!bookMap.has(book.slug)) {
      bookMap.set(book.slug, book);
    }
  }

  // Add author books (fill remaining slots)
  for (const book of authorBooks) {
    if (!bookMap.has(book.slug) && bookMap.size < limit) {
      bookMap.set(book.slug, book);
    }
  }

  // Convert map to array and limit results
  return Array.from(bookMap.values()).slice(0, limit);
}





