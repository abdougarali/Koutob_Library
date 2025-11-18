import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getOrderByCode,
  updateOrderStatus,
  assignDeliveryPartner,
} from "@/lib/services/orderService";
import { sendOrderStatusUpdateEmail } from "@/lib/services/emailService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderCode: string }> },
) {
  try {
    const { orderCode } = await params;
    const decodedCode = decodeURIComponent(orderCode);
    const order = await getOrderByCode(decodedCode);
    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "فشل في جلب الطلب" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderCode: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { orderCode } = await params;
    const decodedCode = decodeURIComponent(orderCode);
    
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error("Error parsing request body:", jsonError);
      return NextResponse.json(
        { error: "بيانات الطلب غير صحيحة" },
        { status: 400 },
      );
    }

    if (!body || (typeof body !== "object")) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة" },
        { status: 400 },
      );
    }

    let order;
    if (body.status) {
      order = await updateOrderStatus(decodedCode, body.status, {
        note: body.note,
        updatedBy: session.user.id,
      });
      
      // Send status update email if email is provided
      if (order && order.email) {
        try {
          await sendOrderStatusUpdateEmail(order.email, {
            orderCode: order.orderCode,
            customerName: order.customerName,
            status: order.status,
            note: body.note,
          });
          if (process.env.NODE_ENV === "development") {
            console.log(`[Order API] Status update email sent to ${order.email}`);
          }
        } catch (emailError) {
          // Log email error but don't fail the status update
          console.error("[Order API] Failed to send status update email:", emailError);
        }
      }
    } else if (body.deliveryPartnerId) {
      order = await assignDeliveryPartner(decodedCode, body.deliveryPartnerId);
    } else {
      return NextResponse.json(
        { error: "بيانات غير صحيحة - يجب تحديد حالة الطلب أو شريك التوصيل" },
        { status: 400 },
      );
    }

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error("Error updating order:", error);
    console.error("Error details:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    
    return NextResponse.json(
      { 
        error: error?.message || "فشل في تحديث الطلب",
        details: process.env.NODE_ENV === "development" ? error?.toString() : undefined,
      },
      { status: 500 },
    );
  }
}

