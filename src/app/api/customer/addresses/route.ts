import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { SavedAddressModel } from "@/lib/models/SavedAddress";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().min(1, "التسمية مطلوبة").max(50, "التسمية طويلة جداً"),
  name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(140),
  phone: z.string().min(8, "رقم الهاتف يجب أن يكون 8 أرقام على الأقل").max(20),
  address: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل").max(240),
  city: z.string().min(2, "المدينة يجب أن تكون حرفين على الأقل").max(90),
  isDefault: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    await dbConnect();
    const addresses = await SavedAddressModel.find({ user: session.user.id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(
      addresses.map((addr) => ({
        ...addr,
        _id: addr._id?.toString(),
        user: addr.user?.toString(),
        createdAt: addr.createdAt?.toISOString(),
        updatedAt: addr.updatedAt?.toISOString(),
      })),
    );
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json({ error: "فشل في جلب العناوين" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const validated = addressSchema.parse(body);

    await dbConnect();

    // If this is set as default, unset other defaults
    if (validated.isDefault) {
      await SavedAddressModel.updateMany(
        { user: session.user.id, isDefault: true },
        { $set: { isDefault: false } },
      );
    }

    const address = await SavedAddressModel.create({
      ...validated,
      user: session.user.id,
    });

    return NextResponse.json({
      ...address.toObject(),
      _id: address._id.toString(),
      user: address.user.toString(),
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Error creating address:", error);
    return NextResponse.json({ error: "فشل في إضافة العنوان" }, { status: 500 });
  }
}








