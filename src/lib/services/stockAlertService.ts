import { dbConnect } from "@/lib/dbConnect";
import { BookModel, type BookDocument } from "@/lib/models/Book";

export const LOW_STOCK_THRESHOLD = 10;

export type LowStockBook = {
  _id: string;
  slug: string;
  title: string;
  stock: number;
  lowStockThreshold: number;
};

/**
 * Check if a book is low stock
 */
export function isLowStock(
  book: BookDocument | { stock?: number; lowStockThreshold?: number },
): boolean {
  const stock = book.stock ?? 0;
  return stock >= 0 && stock <= LOW_STOCK_THRESHOLD;
}

/**
 * Check if a book is out of stock
 */
export function isOutOfStock(book: BookDocument | { stock?: number }): boolean {
  return (book.stock ?? 0) === 0;
}

/**
 * Get stock status for a book
 */
export function getStockStatus(
  book: BookDocument | { stock?: number; lowStockThreshold?: number },
): "in-stock" | "low-stock" | "out-of-stock" {
  if (isOutOfStock(book)) return "out-of-stock";
  if (isLowStock(book)) return "low-stock";
  return "in-stock";
}

/**
 * Get all books with low stock
 */
export async function getLowStockBooks(limit?: number): Promise<LowStockBook[]> {
  await dbConnect();

  const query = BookModel.find({
    status: "published",
    $expr: {
      $and: [
        { $gte: [{ $ifNull: ["$stock", 0] }, 0] }, // Allow 0 stock (out of stock)
        {
          $lte: [
            { $ifNull: ["$stock", 0] },
            LOW_STOCK_THRESHOLD,
          ],
        }, // Stock <= threshold
      ],
    },
  })
    .select("slug title stock")
    .sort({ stock: 1 }) // Sort by stock ascending (lowest first)
    .lean();

  if (limit) {
    query.limit(limit);
  }

  const books = await query;

  return books.map((book) => ({
    _id: book._id?.toString() || "",
    slug: book.slug,
    title: book.title,
    stock: book.stock ?? 0,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
  }));
}

/**
 * Get count of low stock books
 */
export async function getLowStockCount(): Promise<number> {
  await dbConnect();

  return BookModel.countDocuments({
    status: "published",
    $expr: {
      $and: [
        { $gte: [{ $ifNull: ["$stock", 0] }, 0] },
        {
          $lte: [
            { $ifNull: ["$stock", 0] },
            LOW_STOCK_THRESHOLD,
          ],
        },
      ],
    },
  });
}



