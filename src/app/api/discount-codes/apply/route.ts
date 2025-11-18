import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { previewDiscount } from "@/lib/services/discountCodeService";

const applyDiscountSchema = z.object({
  code: z.string().min(3, "الرمز قصير جداً").max(32, "الرمز طويل جداً"),
  subtotal: z.number().min(0, "قيمة الطلب غير صالحة"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = applyDiscountSchema.parse(body);

    const result = await previewDiscount(code, subtotal);

    return NextResponse.json({
      discount: {
        code: result.discount.code,
        type: result.discount.type,
        value: result.discount.value,
        maxDiscountAmount: result.discount.maxDiscountAmount,
        minOrderTotal: result.discount.minOrderTotal,
      },
      discountAmount: result.discountAmount,
      message: "تم تطبيق رمز الخصم بنجاح",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error:
            error.issues?.[0]?.message || "بيانات غير صحيحة. يرجى التحقق من الرمز.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: error?.message || "تعذر تطبيق رمز الخصم. حاول مرة أخرى.",
      },
      { status: 400 },
    );
  }
}








