import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/lib/models/User";
import { generateResetToken, hashToken } from "@/lib/utils/generateToken";
import { sendPasswordResetEmail } from "@/lib/services/emailService";
import { z } from "zod";
import mongoose from "mongoose";

const forgotPasswordSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
});

// Rate limiting: Store attempts in memory (in production, use Redis)
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
    const validated = forgotPasswordSchema.parse(body);
    const email = validated.email.toLowerCase().trim();

    // Rate limiting by IP and email
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `forgot-password:${ip}:${email}`;

    if (!checkRateLimit(rateLimitKey, 3, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة مرة أخرى بعد 15 دقيقة." },
        { status: 429 }
      );
    }

    await dbConnect();

    const user = await UserModel.findOne({ email });

    // Always return success to prevent email enumeration
    // Don't reveal if email exists or not
    if (!user) {
      // Still return success, but don't send email
      return NextResponse.json({
        message: "إذا كان البريد الإلكتروني مسجلاً لدينا، سيتم إرسال رابط إعادة التعيين.",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({
        message: "إذا كان البريد الإلكتروني مسجلاً لدينا، سيتم إرسال رابط إعادة التعيين.",
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = hashToken(resetToken);

    // Set token and expiration (1 hour from now)
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    // Ensure database connection is established
    const mongooseInstance = await dbConnect();
    
    // Use MongoDB native updateOne to bypass Mongoose strict mode issues
    // This ensures the fields are saved directly to the database
    const db = mongooseInstance.connection.db;
    if (!db) {
      console.error("[Forgot Password] Database connection not available");
      throw new Error("Database connection not available");
    }

    // Get the collection name from the model (usually "users" for User model)
    const collectionName = UserModel.collection.name;
    const usersCollection = db.collection(collectionName);
    
    if (process.env.NODE_ENV === "development") {
      console.log("[Forgot Password] Using collection:", collectionName);
      console.log("[Forgot Password] User ID:", user._id.toString());
    }
    
    const updateResult = await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: hashedToken,
          passwordResetExpires: resetExpires,
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      console.error("[Forgot Password] User not found for update");
      throw new Error("فشل في حفظ رمز إعادة التعيين");
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[Forgot Password] Update successful:", {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
      });
    }

    // Get the updated user for verification
    const updatedUser = await UserModel.findById(user._id);

    // Debug logging (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log("[Forgot Password] Update result:", {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
        collectionName,
      });
      console.log("[Forgot Password] Token saved for user:", user.email);
      console.log("[Forgot Password] Hashed token:", hashedToken.substring(0, 20) + "...");
      console.log("[Forgot Password] Token expires at:", resetExpires);
      
      // Wait a bit and verify the token was saved by querying the database again
      await new Promise(resolve => setTimeout(resolve, 200)); // Small delay to ensure DB write
      
      // Query directly from MongoDB collection to verify
      const verifyUserDirect = await usersCollection.findOne(
        { _id: user._id },
        { projection: { passwordResetToken: 1, passwordResetExpires: 1 } }
      );
      console.log("[Forgot Password] Direct DB query - Token:", verifyUserDirect?.passwordResetToken ? verifyUserDirect.passwordResetToken.substring(0, 20) + "..." : "NOT FOUND");
      console.log("[Forgot Password] Direct DB query - Expires:", verifyUserDirect?.passwordResetExpires);
      
      // Also query via Mongoose to see if it picks it up
      const verifyUser = await UserModel.findById(user._id).select("passwordResetToken passwordResetExpires").lean();
      console.log("[Forgot Password] Mongoose query - Token:", verifyUser?.passwordResetToken ? verifyUser.passwordResetToken.substring(0, 20) + "..." : "NOT FOUND");
      console.log("[Forgot Password] Mongoose query - Expires:", verifyUser?.passwordResetExpires);
      
      if (!verifyUserDirect?.passwordResetToken) {
        console.error("[Forgot Password] ERROR: Token was not saved to database!");
      } else {
        console.log("[Forgot Password] ✅ Token successfully saved to database!");
      }
    }

    // Send email
    const emailSent = await sendPasswordResetEmail(user.email, resetToken, user.name);

    // In development, also return the reset token if email service is not configured
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3002"}/reset-password/${resetToken}`;
    
    const response: any = {
      message: "إذا كان البريد الإلكتروني مسجلاً لدينا، سيتم إرسال رابط إعادة التعيين.",
    };

    // Log email status
    if (process.env.NODE_ENV === "development") {
      if (emailSent) {
        console.log("\n" + "=".repeat(60));
        console.log("✅ PASSWORD RESET EMAIL SENT SUCCESSFULLY");
        console.log("To:", user.email);
        console.log("Check your inbox and spam folder");
        console.log("=".repeat(60) + "\n");
      } else {
        console.log("\n" + "=".repeat(60));
        console.log("⚠️ PASSWORD RESET EMAIL NOT SENT");
        console.log("Reason: Email service not configured or error");
        console.log("🔗 PASSWORD RESET LINK (Development Mode - Console Only):");
        console.log(resetUrl);
        console.log("=".repeat(60) + "\n");
      }
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error in forgot password:", error);

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
      message: "إذا كان البريد الإلكتروني مسجلاً لدينا، سيتم إرسال رابط إعادة التعيين.",
    });
  }
}

