import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { WishlistModel } from "@/lib/models/Wishlist";
import { BookModel } from "@/lib/models/Book";
import { UserModel } from "@/lib/models/User";
import { requireAuth } from "@/lib/adminAuth";

// GET: Fetch user's wishlist
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await dbConnect();

    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const wishlistItems = await WishlistModel.find({ user: user._id })
      .populate("book")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ wishlist: wishlistItems });
  } catch (error: any) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "فشل في جلب قائمة الأمنيات" },
      { status: 500 },
    );
  }
}

// POST: Add book to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await dbConnect();

    const body = await request.json();
    const { bookId } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: "معرف الكتاب مطلوب" },
        { status: 400 },
      );
    }

    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // Find book by slug or ObjectId
    let book;
    if (bookId.match(/^[0-9a-fA-F]{24}$/)) {
      book = await BookModel.findById(bookId);
    } else {
      book = await BookModel.findOne({ slug: bookId });
    }

    if (!book) {
      return NextResponse.json({ error: "الكتاب غير موجود" }, { status: 404 });
    }

    // Check if already in wishlist
    const existing = await WishlistModel.findOne({
      user: user._id,
      book: book._id,
    });

    if (existing) {
      return NextResponse.json(
        { error: "الكتاب موجود بالفعل في قائمة الأمنيات" },
        { status: 400 },
      );
    }

    // Add to wishlist
    const wishlistItem = await WishlistModel.create({
      user: user._id,
      book: book._id,
    });

    await wishlistItem.populate("book");

    return NextResponse.json(
      {
        message: "تم إضافة الكتاب إلى قائمة الأمنيات",
        wishlistItem,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error adding to wishlist:", error);
    if (error.code === 11000) {
      // Duplicate key error
      return NextResponse.json(
        { error: "الكتاب موجود بالفعل في قائمة الأمنيات" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "فشل في إضافة الكتاب إلى قائمة الأمنيات" },
      { status: 500 },
    );
  }
}

// DELETE: Remove book from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
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
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // Find book by slug or ObjectId
    let book;
    if (bookId.match(/^[0-9a-fA-F]{24}$/)) {
      book = await BookModel.findById(bookId);
    } else {
      book = await BookModel.findOne({ slug: bookId });
    }

    if (!book) {
      return NextResponse.json({ error: "الكتاب غير موجود" }, { status: 404 });
    }

    // Remove from wishlist
    const deleted = await WishlistModel.findOneAndDelete({
      user: user._id,
      book: book._id,
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "الكتاب غير موجود في قائمة الأمنيات" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "تم حذف الكتاب من قائمة الأمنيات",
    });
  } catch (error: any) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "فشل في حذف الكتاب من قائمة الأمنيات" },
      { status: 500 },
    );
  }
}





















