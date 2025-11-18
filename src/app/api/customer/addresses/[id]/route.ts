import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { SavedAddressModel } from "@/lib/models/SavedAddress";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().min(1).max(50).optional(),
  name: z.string().min(3).max(140).optional(),
  phone: z.string().min(8).max(20).optional(),
  address: z.string().min(5).max(240).optional(),
  city: z.string().min(2).max(90).optional(),
  isDefault: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = addressSchema.parse(body);

    await dbConnect();

    // Check ownership
    const address = await SavedAddressModel.findOne({ _id: id, user: session.user.id });
    if (!address) {
      return NextResponse.json({ error: "العنوان غير موجود" }, { status: 404 });
    }

    // If setting as default, unset other defaults
    if (validated.isDefault) {
      await SavedAddressModel.updateMany(
        { user: session.user.id, _id: { $ne: id }, isDefault: true },
        { $set: { isDefault: false } },
      );
    }

    Object.assign(address, validated);
    await address.save();

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
    console.error("Error updating address:", error);
    return NextResponse.json({ error: "فشل في تحديث العنوان" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const address = await SavedAddressModel.findOneAndDelete({
      _id: id,
      user: session.user.id,
    });

    if (!address) {
      return NextResponse.json({ error: "العنوان غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json({ error: "فشل في حذف العنوان" }, { status: 500 });
  }
}








