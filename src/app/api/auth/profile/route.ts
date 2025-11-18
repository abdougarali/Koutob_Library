import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/lib/models/User";
import { z } from "zod";

// Profile update schema (excludes email, password, role)
const profileUpdateSchema = z.object({
  name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(140).optional(),
  phone: z.string().regex(/^[0-9]{8}$/, "رقم الهاتف يجب أن يكون 8 أرقام").optional().or(z.literal("")),
  address: z.string().max(240).optional().or(z.literal("")),
  city: z.string().max(90).optional().or(z.literal("")),
});

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxAttempts: number = 10, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

// GET: Get current user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await UserModel.findById(session.user.id).select("-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationTokenExpires -loginAttempts -lockUntil");

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      role: user.role,
      emailVerified: user.emailVerified,
    });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الملف الشخصي" },
      { status: 500 }
    );
  }
}

// PATCH: Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    // Rate limiting by user ID
    const rateLimitKey = `profile-update:${session.user.id}`;
    if (!checkRateLimit(rateLimitKey, 10, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة مرة أخرى بعد 15 دقيقة." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = profileUpdateSchema.parse(body);

    await dbConnect();

    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    // Check if phone is being updated and if it's already taken by another user
    if (validated.phone !== undefined && validated.phone.trim().length > 0) {
      const existingPhoneUser = await UserModel.findOne({
        phone: validated.phone.trim(),
        _id: { $ne: user._id },
      });

      if (existingPhoneUser) {
        return NextResponse.json(
          { error: "رقم الهاتف مستخدم بالفعل" },
          { status: 400 }
        );
      }
    }

    // Update fields
    if (validated.name !== undefined) {
      user.name = validated.name.trim();
    }

    if (validated.phone !== undefined) {
      if (validated.phone.trim().length > 0) {
        user.phone = validated.phone.trim();
      } else {
        user.phone = undefined; // Remove phone if empty
      }
    }

    if (validated.address !== undefined) {
      if (validated.address.trim().length > 0) {
        user.address = validated.address.trim();
      } else {
        user.address = undefined; // Remove address if empty
      }
    }

    if (validated.city !== undefined) {
      if (validated.city.trim().length > 0) {
        user.city = validated.city.trim();
      } else {
        user.city = undefined; // Remove city if empty
      }
    }

    await user.save();

    return NextResponse.json({
      message: "تم تحديث الملف الشخصي بنجاح",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
      },
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);

    // Handle Zod validation errors
    if (error?.name === "ZodError") {
      return NextResponse.json(
        {
          error: "بيانات غير صحيحة",
          details: error.issues.map((e: any) => ({
            path: e.path,
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle MongoDB duplicate key error
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "رقم الهاتف مستخدم بالفعل" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "حدث خطأ أثناء تحديث الملف الشخصي" },
      { status: 500 }
    );
  }
}











