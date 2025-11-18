import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { WishlistModel } from "@/lib/models/Wishlist";
import { BookModel } from "@/lib/models/Book";
import { UserModel } from "@/lib/models/User";
import mongoose from "mongoose";

// GET: Check if multiple books are in user's wishlist (batch)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ wishlistMap: {} });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const bookIdsParam = searchParams.get("bookIds");

    if (!bookIdsParam) {
      return NextResponse.json({ wishlistMap: {} });
    }

    // Parse bookIds (comma-separated)
    const bookIds = bookIdsParam.split(",").filter(Boolean);
    
    if (bookIds.length === 0) {
      return NextResponse.json({ wishlistMap: {} });
    }

    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ wishlistMap: {} });
    }

    // Find all books by slug or ObjectId
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

    // Create a map of bookId (slug or _id) to book _id
    const bookIdToObjectId = new Map<string, mongoose.Types.ObjectId>();
    books.forEach((book) => {
      const bookIdStr = book._id.toString();
      bookIdToObjectId.set(bookIdStr, book._id);
      if (book.slug) {
        bookIdToObjectId.set(book.slug, book._id);
      }
    });

    // Get all wishlist items for these books
    const bookObjectIds = Array.from(bookIdToObjectId.values());
    const wishlistItems = await WishlistModel.find({
      user: user._id,
      book: { $in: bookObjectIds },
    }).select("book").lean();

    // Create a set of book ObjectIds that are in wishlist
    const wishlistBookIds = new Set(
      wishlistItems.map((item) => item.book.toString())
    );

    // Build the response map: original bookId -> isInWishlist
    const wishlistMap: Record<string, boolean> = {};
    bookIds.forEach((bookId) => {
      const bookObjectId = bookIdToObjectId.get(bookId);
      if (bookObjectId) {
        wishlistMap[bookId] = wishlistBookIds.has(bookObjectId.toString());
      } else {
        wishlistMap[bookId] = false;
      }
    });

    return NextResponse.json({ wishlistMap });
  } catch (error: any) {
    console.error("Error checking batch wishlist:", error);
    return NextResponse.json({ wishlistMap: {} });
  }
}










