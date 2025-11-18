import { FilterQuery } from "mongoose";
import { dbConnect } from "@/lib/dbConnect";
import { BookModel, type BookDocument } from "@/lib/models/Book";
import {
  bookInputSchema,
  type BookInput,
} from "@/lib/validators/bookValidator";

export type SortOption = "newest" | "oldest" | "price-low" | "price-high" | "title-asc" | "title-desc" | "rating";

export interface BookFilters {
  category?: string;
  format?: "hardcover" | "paperback";
  minPrice?: number;
  maxPrice?: number;
  author?: string;
}

export async function getPublishedBooks(
  filters: FilterQuery<BookDocument> = {},
  searchQuery?: string,
  options?: { 
    limit?: number; 
    skip?: number;
    sort?: SortOption;
    bookFilters?: BookFilters;
  },
) {
  await dbConnect();
  
  const query: FilterQuery<BookDocument> = {
    status: "published",
    ...filters,
  };

  // Apply advanced filters
  if (options?.bookFilters) {
    const { format, minPrice, maxPrice, author } = options.bookFilters;
    
    if (format) {
      query.format = format;
    }
    
    if (author) {
      query.author = { $regex: author.trim(), $options: "i" };
    }
    
    // Price range filter (consider both price and salePrice)
    // Use the effective price (salePrice if exists, otherwise price)
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceConditions: any[] = [];
      
      // Create a condition that checks the effective price (salePrice or price)
      if (minPrice !== undefined && maxPrice !== undefined) {
        // Both min and max
        priceConditions.push({
          $or: [
            // Has salePrice and it's in range
            {
              $and: [
                { salePrice: { $exists: true, $ne: null } },
                { salePrice: { $gte: minPrice, $lte: maxPrice } }
              ]
            },
            // No salePrice, check regular price
            {
              $and: [
                { $or: [{ salePrice: { $exists: false } }, { salePrice: null }] },
                { price: { $gte: minPrice, $lte: maxPrice } }
              ]
            }
          ]
        });
      } else if (minPrice !== undefined) {
        priceConditions.push({
          $or: [
            {
              $and: [
                { salePrice: { $exists: true, $ne: null } },
                { salePrice: { $gte: minPrice } }
              ]
            },
            {
              $and: [
                { $or: [{ salePrice: { $exists: false } }, { salePrice: null }] },
                { price: { $gte: minPrice } }
              ]
            }
          ]
        });
      } else if (maxPrice !== undefined) {
        priceConditions.push({
          $or: [
            {
              $and: [
                { salePrice: { $exists: true, $ne: null } },
                { salePrice: { $lte: maxPrice } }
              ]
            },
            {
              $and: [
                { $or: [{ salePrice: { $exists: false } }, { salePrice: null }] },
                { price: { $lte: maxPrice } }
              ]
            }
          ]
        });
      }
      
      if (priceConditions.length > 0) {
        query.$and = query.$and || [];
        query.$and.push(...priceConditions);
      }
    }
  }

  // If search query is provided, search in title, author, keywords, and description
  if (searchQuery && searchQuery.trim().length > 0) {
    const trimmedQuery = searchQuery.trim();
    // Escape special regex characters
    const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    
    query.$or = [
      { title: { $regex: escapedQuery, $options: "i" } },
      { author: { $regex: escapedQuery, $options: "i" } },
      { keywords: { $regex: escapedQuery, $options: "i" } },
      { description: { $regex: escapedQuery, $options: "i" } },
    ];
  }

  // Select only needed fields for better performance
  const findQuery = BookModel.find(query)
    .select("slug title author category price salePrice imageUrl isFeatured stock format createdAt");

  // Apply sorting
  const sortOption = options?.sort || "newest";
  switch (sortOption) {
    case "newest":
      findQuery.sort({ createdAt: -1 });
      break;
    case "oldest":
      findQuery.sort({ createdAt: 1 });
      break;
    case "price-low":
      // Sort by effective price (salePrice if exists, otherwise price) ascending
      // We'll sort by both fields - books with salePrice will be sorted by salePrice,
      // and books without salePrice will be sorted by price
      findQuery.sort({ salePrice: 1, price: 1 });
      break;
    case "price-high":
      // Sort by effective price descending
      findQuery.sort({ salePrice: -1, price: -1 });
      break;
    case "title-asc":
      findQuery.sort({ title: 1 });
      break;
    case "title-desc":
      findQuery.sort({ title: -1 });
      break;
    case "rating":
      // Rating sorting will be handled after fetching (requires aggregation)
      // For now, sort by newest as fallback
      findQuery.sort({ createdAt: -1 });
      break;
    default:
      findQuery.sort({ createdAt: -1 });
  }

  if (options?.limit) {
    findQuery.limit(options.limit);
  }
  if (options?.skip) {
    findQuery.skip(options.skip);
  }

  const books = await findQuery.lean();
  return books;
}

export async function getPublishedBooksCount(
  filters: FilterQuery<BookDocument> = {},
  searchQuery?: string,
  bookFilters?: BookFilters,
) {
  await dbConnect();
  
  const query: FilterQuery<BookDocument> = {
    status: "published",
    ...filters,
  };

  // Apply advanced filters (same logic as getPublishedBooks)
  if (bookFilters) {
    const { format, minPrice, maxPrice, author } = bookFilters;
    
    if (format) {
      query.format = format;
    }
    
    if (author) {
      query.author = { $regex: author.trim(), $options: "i" };
    }
    
    // Price range filter (same logic as getPublishedBooks)
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceConditions: any[] = [];
      
      if (minPrice !== undefined && maxPrice !== undefined) {
        priceConditions.push({
          $or: [
            {
              $and: [
                { salePrice: { $exists: true, $ne: null } },
                { salePrice: { $gte: minPrice, $lte: maxPrice } }
              ]
            },
            {
              $and: [
                { $or: [{ salePrice: { $exists: false } }, { salePrice: null }] },
                { price: { $gte: minPrice, $lte: maxPrice } }
              ]
            }
          ]
        });
      } else if (minPrice !== undefined) {
        priceConditions.push({
          $or: [
            {
              $and: [
                { salePrice: { $exists: true, $ne: null } },
                { salePrice: { $gte: minPrice } }
              ]
            },
            {
              $and: [
                { $or: [{ salePrice: { $exists: false } }, { salePrice: null }] },
                { price: { $gte: minPrice } }
              ]
            }
          ]
        });
      } else if (maxPrice !== undefined) {
        priceConditions.push({
          $or: [
            {
              $and: [
                { salePrice: { $exists: true, $ne: null } },
                { salePrice: { $lte: maxPrice } }
              ]
            },
            {
              $and: [
                { $or: [{ salePrice: { $exists: false } }, { salePrice: null }] },
                { price: { $lte: maxPrice } }
              ]
            }
          ]
        });
      }
      
      if (priceConditions.length > 0) {
        query.$and = query.$and || [];
        query.$and.push(...priceConditions);
      }
    }
  }

  // If search query is provided, search in title, author, keywords, and description
  if (searchQuery && searchQuery.trim().length > 0) {
    const trimmedQuery = searchQuery.trim();
    // Escape special regex characters
    const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    
    query.$or = [
      { title: { $regex: escapedQuery, $options: "i" } },
      { author: { $regex: escapedQuery, $options: "i" } },
      { keywords: { $regex: escapedQuery, $options: "i" } },
      { description: { $regex: escapedQuery, $options: "i" } },
    ];
  }

  return BookModel.countDocuments(query);
}

export async function getBookBySlug(slug: string) {
  await dbConnect();
  return BookModel.findOne({ slug })
    .select("-__v")
    .lean();
}

export async function getAllBooks(filters: FilterQuery<BookDocument> = {}) {
  await dbConnect();
  const books = await BookModel.find(filters).sort({ createdAt: -1 }).lean();

  return books.map((book) => ({
    ...book,
    _id: book._id?.toString(),
    createdAt: book.createdAt?.toISOString(),
    updatedAt: book.updatedAt?.toISOString(),
    // Sanitize images subdocuments to plain objects without Mongo _id
    images: Array.isArray((book as any).images)
      ? (book as any).images.map((img: any) => ({
          publicId: img?.publicId ?? undefined,
          url: img?.url ?? undefined,
          width: img?.width ?? undefined,
          height: img?.height ?? undefined,
          format: img?.format ?? undefined,
          isPrimary: !!img?.isPrimary,
        }))
      : undefined,
  }));
}

export async function getBookCategories() {
  await dbConnect();
  const categories = await BookModel.distinct("category", {
    status: "published",
  });
  return categories.filter((item): item is string => Boolean(item));
}

export async function createBook(payload: BookInput) {
  const validated = bookInputSchema.parse(payload);
  await dbConnect();
  return BookModel.create(validated);
}

export async function updateBook(slug: string, payload: Partial<BookInput>) {
  const merged = bookInputSchema.partial().parse(payload);
  await dbConnect();
  return BookModel.findOneAndUpdate({ slug }, merged, {
    new: true,
  });
}

export async function deleteBook(slug: string) {
  await dbConnect();
  // Hard delete - remove book from database permanently
  return BookModel.findOneAndDelete({ slug });
}

/**
 * Autocomplete search - returns lightweight book suggestions for dropdown
 * @param query - Search query (min 2 characters)
 * @param limit - Maximum number of results (default: 8)
 */
export async function autocompleteSearch(query: string, limit: number = 8) {
  await dbConnect();
  
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  const trimmedQuery = query.trim();
  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
  const searchQuery: FilterQuery<BookDocument> = {
    status: "published",
    $or: [
      { title: { $regex: escapedQuery, $options: "i" } },
      { author: { $regex: escapedQuery, $options: "i" } },
      { keywords: { $regex: escapedQuery, $options: "i" } },
    ],
  };
  
  const books = await BookModel.find(searchQuery)
    .select("slug title author imageUrl")
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();
  
  return books.map((book) => ({
    slug: book.slug,
    title: book.title,
    author: book.author,
    imageUrl: book.imageUrl,
  }));
}




