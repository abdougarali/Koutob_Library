import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAllDeliveryPartners,
  createDeliveryPartner,
} from "@/lib/services/deliveryService";
import {
  deliveryPartnerInputSchema,
} from "@/lib/validators/deliveryPartnerValidator";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const partners = await getAllDeliveryPartners();
    return NextResponse.json(partners);
  } catch (error) {
    console.error("Error fetching delivery partners:", error);
    return NextResponse.json(
      { error: "فشل في جلب شركاء التوصيل" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const validated = deliveryPartnerInputSchema.parse(body);
    const partner = await createDeliveryPartner(validated);

    return NextResponse.json(partner, { status: 201 });
  } catch (error: any) {
    console.error("Error creating delivery partner:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "بيانات غير صحيحة", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "فشل في إنشاء شريك التوصيل" },
      { status: 500 },
    );
  }
}

























