import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/lib/models/User";
import { PendingUserModel } from "@/lib/models/PendingUser";
import { generateResetToken, hashToken } from "@/lib/utils/generateToken";
import { sendVerificationEmail } from "@/lib/services/emailService";
import { z } from "zod";
import mongoose from "mongoose";

const resendVerificationSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
});

// Rate limiting: Store attempts in memory (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxAttempts: number = 3, windowMs: number = 15 * 60 * 1000): boolean {
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
    const validated = resendVerificationSchema.parse(body);
    const email = validated.email.toLowerCase().trim();

    // Rate limiting by IP and email
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `resend-verification:${ip}:${email}`;

    if (!checkRateLimit(rateLimitKey, 3, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة مرة أخرى بعد 15 دقيقة." },
        { status: 429 }
      );
    }

    await dbConnect();

    // Check if user already exists (already verified)
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json({
        message: "البريد الإلكتروني مؤكد بالفعل",
      });
    }

    // Find pending user
    const pendingUser = await PendingUserModel.findOne({ email });

    // Always return success to prevent email enumeration
    if (!pendingUser) {
      return NextResponse.json({
        message: "إذا كان البريد الإلكتروني مسجلاً لدينا، سيتم إرسال رابط التحقق.",
      });
    }

    // Generate new verification token
    const verificationToken = generateResetToken(32);
    const hashedVerificationToken = hashToken(verificationToken);

    // Set token expiration (24 hours from now)
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Update pending user with new token
    const mongooseInstance = await dbConnect();
    const db = mongooseInstance.connection.db;
    if (!db) {
      throw new Error("Database connection not available");
    }

    const collectionName = PendingUserModel.collection.name;
    const pendingUsersCollection = db.collection(collectionName);

    const updateResult = await pendingUsersCollection.updateOne(
      { _id: pendingUser._id },
      {
        $set: {
          emailVerificationToken: hashedVerificationToken,
          emailVerificationTokenExpires: verificationExpires,
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      throw new Error("فشل في تحديث رمز التحقق");
    }

    // Send verification email
    const emailSent = await sendVerificationEmail(pendingUser.email, verificationToken, pendingUser.name);

    const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3002"}/verify-email/${verificationToken}`;

    const response: any = {
      message: "إذا كان البريد الإلكتروني مسجلاً لدينا، سيتم إرسال رابط التحقق.",
    };

    // Log email status
    if (process.env.NODE_ENV === "development") {
      if (emailSent) {
        console.log("\n" + "=".repeat(60));
        console.log("✅ VERIFICATION EMAIL SENT SUCCESSFULLY");
        console.log("To:", pendingUser.email);
        console.log("Check your inbox and spam folder");
        console.log("=".repeat(60) + "\n");
      } else {
        console.log("\n" + "=".repeat(60));
        console.log("⚠️ VERIFICATION EMAIL NOT SENT");
        console.log("Reason: Email service not configured or error");
        console.log("🔗 VERIFICATION LINK (Development Mode):");
        console.log(verificationUrl);
        console.log("=".repeat(60) + "\n");

        // Include in response for development
        response.devVerificationLink = verificationUrl;
      }
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error resending verification email:", error);

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

    // Always return success to prevent information leakage
    return NextResponse.json({
      message: "إذا كان البريد الإلكتروني مسجلاً لدينا، سيتم إرسال رابط التحقق.",
    });
  }
}

