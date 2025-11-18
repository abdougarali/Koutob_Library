import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateUser, deleteUser } from "@/lib/services/userService";
import { userUpdateSchema } from "@/lib/validators/userValidator";

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
    const validated = userUpdateSchema.parse(body);
    const user = await updateUser(id, validated);

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 },
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error updating user:", error);
    console.error("Error name:", error?.name);
    console.error("Error code:", error?.code);
    console.error("Error message:", error?.message);
    
    // Handle Zod validation errors
    if (error?.name === "ZodError" && error?.issues) {
      const zodErrors = error.issues.map((e: any) => ({
        path: e.path || [],
        message: e.message || "قيمة غير صحيحة"
      }));
      
      console.error("Zod validation errors:", zodErrors);
      
      return NextResponse.json(
        { 
          error: "بيانات غير صحيحة", 
          details: zodErrors
        },
        { status: 400 },
      );
    }
    
    // Handle MongoDB duplicate key error
    if (error?.code === 11000) {
      const keyValue = error?.keyValue || {};
      const keyPattern = error?.keyPattern || {};
      
      // Check which field caused the duplicate error
      if (keyValue.email) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مستخدم بالفعل" },
          { status: 400 },
        );
      } else if (keyValue.phone) {
        return NextResponse.json(
          { error: `رقم الهاتف "${keyValue.phone}" مستخدم بالفعل. يرجى استخدام رقم هاتف آخر أو ترك الحقل فارغاً.` },
          { status: 400 },
        );
      } else {
        // Generic duplicate key error
        const fieldName = Object.keys(keyValue)[0] || "حقل";
        return NextResponse.json(
          { error: `القيمة المدخلة في ${fieldName} مستخدمة بالفعل` },
          { status: 400 },
        );
      }
    }
    
    // Handle other errors
    return NextResponse.json(
      { error: error?.message || "فشل في تحديث المستخدم" },
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
    const user = await deleteUser(id);

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "فشل في حذف المستخدم" },
      { status: 500 },
    );
  }
}

