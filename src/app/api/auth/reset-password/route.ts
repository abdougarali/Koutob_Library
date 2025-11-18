import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/lib/models/User";
import { hashPassword } from "@/lib/utils/password";
import { hashToken } from "@/lib/utils/generateToken";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "رمز إعادة التعيين مطلوب"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
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
    const body = await request.json();
    const validated = resetPasswordSchema.parse(body);

    // Rate limiting by IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `reset-password:${ip}`;

    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة مرة أخرى بعد 15 دقيقة." },
        { status: 429 }
      );
    }

    await dbConnect();

    // Hash the token to compare with stored token
    const hashedToken = hashToken(validated.token);

    // Debug logging (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log("[Reset Password] Looking for token:", hashedToken.substring(0, 20) + "...");
      console.log("[Reset Password] Current time:", new Date());
    }

    // Find user with valid token
    // First check if token exists (even if expired) for better error messages
    const userWithToken = await UserModel.findOne({
      passwordResetToken: hashedToken,
    }).lean();

    if (!userWithToken) {
      // Debug: check if any reset tokens exist
      if (process.env.NODE_ENV === "development") {
        const allUsersWithTokens = await UserModel.find({
          passwordResetToken: { $exists: true, $ne: null },
        }).select("email passwordResetExpires").lean();
        console.log("[Reset Password] Users with reset tokens:", allUsersWithTokens.length);
        if (allUsersWithTokens.length > 0) {
          console.log("[Reset Password] Sample token:", allUsersWithTokens[0].passwordResetToken?.substring(0, 20) + "...");
          console.log("[Reset Password] Looking for:", hashedToken.substring(0, 20) + "...");
        }
      }

      return NextResponse.json(
        { error: "رمز إعادة التعيين غير صحيح." },
        { status: 400 }
      );
    }

    // Check if token is expired
    const now = new Date();
    if (userWithToken.passwordResetExpires && userWithToken.passwordResetExpires < now) {
      console.log("[Reset Password] Token found but expired. Expires at:", userWithToken.passwordResetExpires);
      return NextResponse.json(
        { error: "رمز إعادة التعيين منتهي الصلاحية. يرجى طلب رابط جديد." },
        { status: 400 }
      );
    }

    // Get the full user document for updating
    const user = await UserModel.findById(userWithToken._id);
    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود." },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(validated.password);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0; // Reset login attempts
    user.lockUntil = undefined; // Unlock account if locked
    await user.save();

    return NextResponse.json({
      message: "تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.",
    });
  } catch (error: any) {
    console.error("Error in reset password:", error);

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
      { error: "حدث خطأ أثناء إعادة تعيين كلمة المرور" },
      { status: 500 }
    );
  }
}

