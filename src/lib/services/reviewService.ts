import { dbConnect } from "@/lib/dbConnect";
import { ReviewModel } from "@/lib/models/Review";
import { BookModel } from "@/lib/models/Book";
import mongoose from "mongoose";

/**
 * Get average rating and review count for a single book
 */
export async function getBookRatingStats(bookId: string) {
  await dbConnect();

  const stats = await ReviewModel.aggregate([
    { $match: { book: bookId, isApproved: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (!stats || stats.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
    };
  }

  return {
    averageRating: Math.round(stats[0].averageRating * 10) / 10,
    totalReviews: stats[0].totalReviews,
  };
}

/**
 * Get average ratings for multiple books
 */
export async function getBooksRatingStats(bookIds: string[]) {
  if (bookIds.length === 0) {
    return new Map();
  }

  await dbConnect();

  // Convert bookIds to ObjectIds (handle both ObjectId strings and slugs)
  const bookObjectIds: mongoose.Types.ObjectId[] = [];
  const bookIdMap = new Map<string, mongoose.Types.ObjectId>(); // Map original id to ObjectId

  // First, find all books by slug or ObjectId
  const bookQueries = bookIds.map((bookId) => {
    if (bookId.match(/^[0-9a-fA-F]{24}$/)) {
      return { _id: new mongoose.Types.ObjectId(bookId) };
    } else {
      return { slug: bookId };
    }
  });

  const books = await BookModel.find({
    $or: bookQueries,
  }).select("_id slug").lean();

  // Create mapping
  books.forEach((book) => {
    const objectId = book._id;
    bookObjectIds.push(objectId);
    
    // Map both ObjectId string and slug to the ObjectId
    bookIdMap.set(objectId.toString(), objectId);
    if (book.slug) {
      bookIdMap.set(book.slug, objectId);
    }
  });

  if (bookObjectIds.length === 0) {
    return new Map();
  }

  const stats = await ReviewModel.aggregate([
    {
      $match: {
        book: { $in: bookObjectIds },
        isApproved: true,
      },
    },
    {
      $group: {
        _id: "$book",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  // Create a map for quick lookup (using original bookIds as keys)
  const statsMap = new Map();
  stats.forEach((stat) => {
    const bookObjectId = stat._id.toString();
    const ratingData = {
      averageRating: Math.round(stat.averageRating * 10) / 10,
      totalReviews: stat.totalReviews,
    };
    
    // Map to all possible keys (ObjectId string and slug)
    bookIdMap.forEach((objectId, key) => {
      if (objectId.toString() === bookObjectId) {
        statsMap.set(key, ratingData);
      }
    });
  });

  return statsMap;
}

