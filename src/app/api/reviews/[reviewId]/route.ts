import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { ReviewModel } from "@/lib/models/Review";
import { requireAdmin } from "@/lib/adminAuth";

// PATCH: Approve or reject a review (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> },
) {
  try {
    const session = await requireAdmin();
    await dbConnect();

    const { reviewId } = await params;
    const body = await request.json();
    const { isApproved } = body;

    if (typeof isApproved !== "boolean") {
      return NextResponse.json(
        { error: "يجب تحديد حالة الموافقة" },
        { status: 400 },
      );
    }

    const review = await ReviewModel.findByIdAndUpdate(
      reviewId,
      {
        isApproved,
        approvedBy: session.user.id,
        approvedAt: new Date(),
      },
      { new: true },
    ).populate("user", "name email");

    if (!review) {
      return NextResponse.json({ error: "التقييم غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      message: isApproved ? "تم الموافقة على التقييم" : "تم رفض التقييم",
      review,
    });
  } catch (error: any) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "فشل في تحديث التقييم" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a review (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> },
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { reviewId } = await params;
    const review = await ReviewModel.findByIdAndDelete(reviewId);

    if (!review) {
      return NextResponse.json({ error: "التقييم غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ message: "تم حذف التقييم بنجاح" });
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "فشل في حذف التقييم" },
      { status: 500 },
    );
  }
}





















