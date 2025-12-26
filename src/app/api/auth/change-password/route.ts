import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/lib/models/User";
import { hashPassword, comparePassword } from "@/lib/utils/password";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
  newPassword: z.string().min(6, "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"),
});

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    // Rate limiting by user ID
    const rateLimitKey = `change-password:${session.user.id}`;
    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة مرة أخرى بعد 15 دقيقة." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = changePasswordSchema.parse(body);

    await dbConnect();

    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      validated.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "كلمة المرور الحالية غير صحيحة" },
        { status: 400 }
      );
    }

    // Check if new password is different from current password
    const isSamePassword = await comparePassword(
      validated.newPassword,
      user.password
    );

    if (isSamePassword) {
      return NextResponse.json(
        { error: "كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(validated.newPassword);

    // Update password
    user.password = hashedNewPassword;
    user.loginAttempts = 0; // Reset login attempts
    user.lockUntil = undefined; // Unlock account if locked
    await user.save();

    if (process.env.NODE_ENV === "development") {
      console.log(`[Change Password] Password updated for user: ${user.email}`);
    }

    return NextResponse.json({
      message: "تم تغيير كلمة المرور بنجاح",
    });
  } catch (error: any) {
    console.error("Error changing password:", error);

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

    return NextResponse.json(
      { error: error?.message || "حدث خطأ أثناء تغيير كلمة المرور" },
      { status: 500 }
    );
  }
}






















