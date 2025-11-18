import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createUser } from "@/lib/services/userService";
import { userInputSchema } from "@/lib/validators/userValidator";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    // Override role to "admin" for users created in admin panel
    const bodyWithAdminRole = { ...body, role: "admin" };
    const validated = userInputSchema.parse(bodyWithAdminRole);
    const user = await createUser(validated);

    return NextResponse.json(
      {
        ...user,
        _id: user._id?.toString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
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
      { error: error?.message || "فشل في إنشاء المستخدم" },
      { status: 500 },
    );
  }
}

