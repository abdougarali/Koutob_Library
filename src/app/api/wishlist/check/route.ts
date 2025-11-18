import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { WishlistModel } from "@/lib/models/Wishlist";
import { BookModel } from "@/lib/models/Book";
import { UserModel } from "@/lib/models/User";

// GET: Check if a book is in user's wishlist
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ isInWishlist: false });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const bookId = searchParams.get("bookId");

    if (!bookId) {
      return NextResponse.json(
        { error: "معرف الكتاب مطلوب" },
        { status: 400 },
      );
    }

    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ isInWishlist: false });
    }

    // Find book by slug or ObjectId
    let book;
    if (bookId.match(/^[0-9a-fA-F]{24}$/)) {
      book = await BookModel.findById(bookId);
    } else {
      book = await BookModel.findOne({ slug: bookId });
    }

    if (!book) {
      return NextResponse.json({ isInWishlist: false });
    }

    // Check if in wishlist
    const wishlistItem = await WishlistModel.findOne({
      user: user._id,
      book: book._id,
    });

    return NextResponse.json({
      isInWishlist: !!wishlistItem,
    });
  } catch (error: any) {
    console.error("Error checking wishlist:", error);
    return NextResponse.json({ isInWishlist: false });
  }
}










