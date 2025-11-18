import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { discountCodeInputSchema } from "@/lib/validators/discountCodeValidator";
import {
  createDiscountCode,
  getAllDiscountCodes,
} from "@/lib/services/discountCodeService";

export async function GET() {
  try {
    await requireAdmin();
    const codes = await getAllDiscountCodes();
    return NextResponse.json({ codes });
  } catch (error) {
    console.error("Error fetching discount codes:", error);
    return NextResponse.json(
      { error: "فشل في جلب رموز الخصم" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = discountCodeInputSchema.parse(body);
    const created = await createDiscountCode(parsed);
    return NextResponse.json({ discount: created });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "بيانات غير صحيحة", details: error.issues },
        { status: 400 },
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "رمز الخصم مستخدم بالفعل" },
        { status: 400 },
      );
    }

    console.error("Error creating discount code:", error);
    return NextResponse.json(
      { error: "فشل في إنشاء رمز الخصم" },
      { status: 500 },
    );
  }
}








