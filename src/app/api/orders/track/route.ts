import { NextRequest, NextResponse } from "next/server";
import { getCustomerOrders, getOrderByCode } from "@/lib/services/orderService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawCode: unknown = body?.orderCode;
    const rawPhone: unknown = body?.phone;

    if (
      (typeof rawCode !== "string" || rawCode.trim().length === 0) &&
      (typeof rawPhone !== "string" || rawPhone.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: "يرجى إدخال رقم الطلب أو رقم الهاتف." },
        { status: 400 },
      );
    }

    if (typeof rawCode === "string" && rawCode.trim().length > 0) {
      const orderCode = rawCode.trim();
      const order = await getOrderByCode(orderCode);
      if (!order) {
        return NextResponse.json(
          { error: "الطلب غير موجود." },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          orders: [order],
          mode: "code",
        },
      });
    }

    if (typeof rawPhone === "string" && rawPhone.trim().length > 0) {
      const phone = rawPhone.trim();
      const orders = await getCustomerOrders(undefined, phone);

      if (!orders.length) {
        return NextResponse.json(
          { error: "لا توجد طلبات مرتبطة بهذا الرقم." },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          orders,
          mode: "phone",
        },
      });
    }

    return NextResponse.json(
      { error: "تعذر تحديد الطلب. يرجى المحاولة مرة أخرى." },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error tracking order:", error);
    return NextResponse.json(
      { error: "فشل في جلب الطلب. يرجى المحاولة مرة أخرى لاحقاً." },
      { status: 500 },
    );
  }
}





















