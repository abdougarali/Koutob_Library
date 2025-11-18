import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { ReviewModel } from "@/lib/models/Review";
import { BookModel } from "@/lib/models/Book";
import { OrderModel } from "@/lib/models/Order";
import { UserModel } from "@/lib/models/User";
import { reviewInputSchema } from "@/lib/validators/reviewValidator";
import { requireAuth } from "@/lib/adminAuth";
import mongoose from "mongoose";

// GET: Fetch all approved reviews for a book
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await dbConnect();
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // Find book by slug
    const book = await BookModel.findOne({ slug: decodedSlug });
    if (!book) {
      return NextResponse.json({ error: "الكتاب غير موجود" }, { status: 404 });
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const includePending = searchParams.get("includePending") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Build query
    const query: any = { book: book._id };
    if (!includePending) {
      query.isApproved = true;
    }

    // Fetch reviews with user info
    const reviews = await ReviewModel.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Calculate average rating and total count
    const stats = await ReviewModel.aggregate([
      { $match: { book: book._id, isApproved: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    const averageRating = stats[0]?.averageRating || 0;
    const totalReviews = stats[0]?.totalReviews || 0;

    // Calculate rating distribution
    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    if (stats[0]?.ratingDistribution) {
      stats[0].ratingDistribution.forEach((rating: number) => {
        ratingDistribution[rating as keyof typeof ratingDistribution]++;
      });
    }

    return NextResponse.json({
      reviews,
      stats: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews,
        ratingDistribution,
      },
    });
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "فشل في جلب التقييمات" },
      { status: 500 },
    );
  }
}

// POST: Create a new review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await requireAuth();
    await dbConnect();

    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // Find book by slug or ObjectId
    let book;
    if (decodedSlug.match(/^[0-9a-fA-F]{24}$/)) {
      book = await BookModel.findById(decodedSlug);
    } else {
      book = await BookModel.findOne({ slug: decodedSlug });
    }
    
    if (!book) {
      return NextResponse.json({ error: "الكتاب غير موجود" }, { status: 404 });
    }

    // Find user
    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // Check if user already reviewed this book
    const existingReview = await ReviewModel.findOne({
      book: book._id,
      user: user._id,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "لقد قمت بتقييم هذا الكتاب من قبل" },
        { status: 400 },
      );
    }

    // Parse and validate input
    const body = await request.json();
    const validated = reviewInputSchema.parse(body);

    // Check if user has purchased this book (for verified purchase badge)
    // Convert book._id to ObjectId if it's a string
    const bookObjectId = typeof book._id === "string" 
      ? new mongoose.Types.ObjectId(book._id) 
      : book._id;
    
    const hasPurchased = await OrderModel.findOne({
      email: user.email?.toLowerCase(),
      "items.book": bookObjectId,
      status: { $ne: "تم الإلغاء" },
    });

    // Create review
    const review = await ReviewModel.create({
      book: book._id,
      user: user._id,
      rating: validated.rating,
      comment: validated.comment || "",
      verifiedPurchase: !!hasPurchased,
      isApproved: false, // Requires admin approval
    });

    // Populate user info
    await review.populate("user", "name email");

    return NextResponse.json(
      {
        message: "تم إرسال التقييم بنجاح. سيتم مراجعته من قبل الإدارة قبل النشر.",
        review,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating review:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "بيانات غير صحيحة",
          details: error.errors,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "فشل في إضافة التقييم" },
      { status: 500 },
    );
  }
}

