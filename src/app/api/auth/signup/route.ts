import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/lib/models/User";
import { PendingUserModel } from "@/lib/models/PendingUser";
import { hashPassword } from "@/lib/utils/password";
import { generateResetToken, hashToken } from "@/lib/utils/generateToken";
import { sendVerificationEmail } from "@/lib/services/emailService";
import { z } from "zod";
import mongoose from "mongoose";

// Sign-up schema for customer registration
const signupSchema = z.object({
  name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(140),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  phone: z.string().regex(/^[0-9]{8}$/, "رقم الهاتف يجب أن يكون 8 أرقام").optional().or(z.literal("")),
  address: z.string().max(240).optional().or(z.literal("")),
  city: z.string().max(90).optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = signupSchema.parse(body);

    await dbConnect();

    const email = validated.email.toLowerCase().trim();

    // Check if email already exists in Users or PendingUsers
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مستخدم بالفعل" },
        { status: 400 }
      );
    }

    const existingPendingUser = await PendingUserModel.findOne({ email });
    if (existingPendingUser) {
      return NextResponse.json(
        { error: "تم إرسال رابط التحقق مسبقاً. يرجى التحقق من بريدك الإلكتروني." },
        { status: 400 }
      );
    }

    // Check if phone already exists (if provided)
    if (validated.phone && validated.phone.trim().length > 0) {
      const existingPhone = await UserModel.findOne({
        phone: validated.phone.trim(),
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: "رقم الهاتف مستخدم بالفعل" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(validated.password);

    // Generate email verification token
    const verificationToken = generateResetToken(32);
    const hashedVerificationToken = hashToken(verificationToken);
    
    // Set token expiration (24 hours from now)
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Save to PendingUser (NOT to User - user will be created after verification)
    const pendingUserData: any = {
      name: validated.name.trim(),
      email: email,
      password: hashedPassword,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationTokenExpires: verificationExpires,
    };

    // Only include phone if it has a value
    if (validated.phone && validated.phone.trim().length > 0) {
      pendingUserData.phone = validated.phone.trim();
    }

    // Include optional fields
    if (validated.address && validated.address.trim().length > 0) {
      pendingUserData.address = validated.address.trim();
    }

    if (validated.city && validated.city.trim().length > 0) {
      pendingUserData.city = validated.city.trim();
    }

    // Save to PendingUser collection (temporary storage)
    const pendingUser = await PendingUserModel.create(pendingUserData);

    if (process.env.NODE_ENV === "development") {
      console.log("[Signup] ✅ Pending user created (not saved to Users yet)");
      console.log("[Signup] User will be created after email verification");
    }

    // Send verification email
    const emailSent = await sendVerificationEmail(
      email,
      verificationToken,
      validated.name.trim()
    );

    // In development, also return the verification token if email service is not configured
    const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3002"}/verify-email/${verificationToken}`;
    
    if (process.env.NODE_ENV === "development") {
      if (emailSent) {
        console.log("\n" + "=".repeat(60));
        console.log("✅ VERIFICATION EMAIL SENT SUCCESSFULLY");
        console.log("To:", email);
        console.log("Check your inbox and spam folder");
        console.log("=".repeat(60) + "\n");
      } else {
        console.log("\n" + "=".repeat(60));
        console.log("⚠️ VERIFICATION EMAIL NOT SENT");
        console.log("Reason: Email service not configured or error");
        console.log("🔗 EMAIL VERIFICATION LINK (Development Mode):");
        console.log(verificationUrl);
        console.log("=".repeat(60) + "\n");
      }
    }

    const response: any = {
      message: "تم إرسال رابط التحقق إلى بريدك الإلكتروني. يرجى النقر على الرابط لتأكيد حسابك وإنشائه.",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle Zod validation errors
    if (error?.name === "ZodError" && error?.issues) {
      const zodErrors = error.issues.map((e: any) => ({
        path: e.path || [],
        message: e.message || "قيمة غير صحيحة",
      }));

      return NextResponse.json(
        {
          error: "بيانات غير صحيحة",
          details: zodErrors,
        },
        { status: 400 }
      );
    }

    // Handle MongoDB duplicate key error
    if (error?.code === 11000) {
      const keyValue = error?.keyValue || {};

      if (keyValue.email) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مستخدم بالفعل" },
          { status: 400 }
        );
      } else if (keyValue.phone) {
        return NextResponse.json(
          { error: "رقم الهاتف مستخدم بالفعل" },
          { status: 400 }
        );
      }
    }

    // Handle other errors
    return NextResponse.json(
      { error: error?.message || "فشل في إنشاء الحساب" },
      { status: 500 }
    );
  }
}



