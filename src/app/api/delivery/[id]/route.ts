import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  updateDeliveryPartner,
  deleteDeliveryPartner,
} from "@/lib/services/deliveryService";
import {
  deliveryPartnerInputSchema,
} from "@/lib/validators/deliveryPartnerValidator";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = deliveryPartnerInputSchema.partial().parse(body);
    const partner = await updateDeliveryPartner(id, validated);

    if (!partner) {
      return NextResponse.json(
        { error: "شريك التوصيل غير موجود" },
        { status: 404 },
      );
    }

    return NextResponse.json(partner);
  } catch (error: any) {
    console.error("Error updating delivery partner:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "بيانات غير صحيحة", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "فشل في تحديث شريك التوصيل" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    const partner = await deleteDeliveryPartner(id);

    if (!partner) {
      return NextResponse.json(
        { error: "شريك التوصيل غير موجود" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "تم حذف شريك التوصيل بنجاح" });
  } catch (error) {
    console.error("Error deleting delivery partner:", error);
    return NextResponse.json(
      { error: "فشل في حذف شريك التوصيل" },
      { status: 500 },
    );
  }
}

























