import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { ReviewModel } from "@/lib/models/Review";
import { requireAdmin } from "@/lib/adminAuth";

// GET: Fetch all reviews with optional filter
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "all";

    // Build query
    const query: any = {};
    if (filter === "pending") {
      query.isApproved = false;
    } else if (filter === "approved") {
      query.isApproved = true;
    }
    // "all" shows everything

    // Fetch reviews with book and user info
    const reviews = await ReviewModel.find(query)
      .populate("book", "title slug")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "فشل في جلب التقييمات" },
      { status: 500 },
    );
  }
}










