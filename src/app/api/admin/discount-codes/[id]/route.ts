import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { discountCodeInputSchema } from "@/lib/validators/discountCodeValidator";
import {
  deleteDiscountCode,
  updateDiscountCode,
} from "@/lib/services/discountCodeService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = discountCodeInputSchema.partial().parse(body);
    const updated = await updateDiscountCode(id, parsed);
    return NextResponse.json({ discount: updated });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "بيانات غير صحيحة", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Error updating discount code:", error);
    return NextResponse.json(
      { error: error.message || "فشل في تحديث رمز الخصم" },
      { status: error.message === "رمز الخصم غير موجود" ? 404 : 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteDiscountCode(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting discount code:", error);
    return NextResponse.json(
      { error: "فشل في حذف رمز الخصم" },
      { status: 500 },
    );
  }
}








