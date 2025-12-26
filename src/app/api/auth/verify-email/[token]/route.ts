import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/lib/models/User";
import { PendingUserModel } from "@/lib/models/PendingUser";
import { NewsletterSubscriberModel } from "@/lib/models/NewsletterSubscriber";
import { hashToken } from "@/lib/utils/generateToken";
import { sendWelcomeEmail } from "@/lib/services/emailService";
import { syncSubscriberToESP } from "@/lib/services/espService";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "رمز التحقق غير صحيح" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Hash the token to compare with stored hash
    const hashedToken = hashToken(token);

    if (process.env.NODE_ENV === "development") {
      console.log("[Email Verification] Verifying token...");
      console.log("[Email Verification] Token (first 20 chars):", token.substring(0, 20) + "...");
      console.log("[Email Verification] Hashed token (first 20 chars):", hashedToken.substring(0, 20) + "...");
    }

    // Find pending user with valid, unexpired token
    const pendingUser = await PendingUserModel.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpires: { $gt: new Date() },
    });

    if (!pendingUser) {
      // Check if token expired
      const expiredPendingUser = await PendingUserModel.findOne({
        emailVerificationToken: hashedToken,
      });

      if (process.env.NODE_ENV === "development") {
        if (expiredPendingUser) {
          console.log("[Email Verification] Token expired");
          console.log("[Email Verification] Token expires at:", expiredPendingUser.emailVerificationTokenExpires);
          console.log("[Email Verification] Current time:", new Date());
        } else {
          console.log("[Email Verification] No pending user found with this token");
        }
      }

      return NextResponse.json(
        { error: "رمز التحقق غير صحيح أو منتهي الصلاحية" },
        { status: 400 }
      );
    }

    // Check if user already exists (shouldn't happen, but check anyway)
    const existingUser = await UserModel.findOne({ email: pendingUser.email });
    if (existingUser) {
      // User already exists, delete pending user and return success
      await PendingUserModel.deleteOne({ _id: pendingUser._id });
      return NextResponse.json(
        { message: "البريد الإلكتروني مؤكد بالفعل" },
        { status: 200 }
      );
    }

    // Create the actual user in database (NOW - after verification)
    const userData: any = {
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: "customer",
      isActive: true,
      emailVerified: true, // Verified since they clicked the link
    };

    // Include optional fields
    if (pendingUser.phone) {
      userData.phone = pendingUser.phone;
    }
    if (pendingUser.address) {
      userData.address = pendingUser.address;
    }
    if (pendingUser.city) {
      userData.city = pendingUser.city;
    }

    // Create user in database
    const user = await UserModel.create(userData);

    // Subscribe to newsletter if opted in during signup
    if ((pendingUser as any).subscribeNewsletter) {
      try {
        const existingSubscriber = await NewsletterSubscriberModel.findOne({
          email: user.email,
        });

        let subscriber;
        if (!existingSubscriber) {
          subscriber = await NewsletterSubscriberModel.create({
            email: user.email,
            name: user.name,
            source: "signup",
            isActive: true,
            locale: "ar",
            espStatus: "pending",
          });
        } else if (!existingSubscriber.isActive) {
          // Reactivate if previously unsubscribed
          existingSubscriber.isActive = true;
          existingSubscriber.source = "signup";
          existingSubscriber.subscribedAt = new Date();
          await existingSubscriber.save();
          subscriber = existingSubscriber;
        } else {
          subscriber = existingSubscriber;
        }

        // Sync to ESP (Brevo) if subscriber exists
        if (subscriber) {
          try {
            const tags = [
              subscriber.source,
              subscriber.locale || "ar",
              ...(subscriber.interests || []),
            ];

            const syncResult = await syncSubscriberToESP(
              subscriber.email,
              subscriber.name || undefined,
              subscriber.source,
              tags,
            );

            if (syncResult.success) {
              subscriber.espStatus = "synced";
              subscriber.espContactId = syncResult.espContactId;
              subscriber.espLastSyncedAt = new Date();
              subscriber.espSyncError = undefined;
            } else {
              subscriber.espStatus = "error";
              subscriber.espSyncError = syncResult.error;
            }
            await subscriber.save();
          } catch (syncError) {
            console.error("[Email Verification] ESP sync failed:", syncError);
            subscriber.espStatus = "error";
            subscriber.espSyncError = String(syncError);
            await subscriber.save();
          }
        }
      } catch (newsletterError: any) {
        // Log but don't fail user creation if newsletter subscription fails
        console.error("Error subscribing to newsletter:", newsletterError);
      }
    }

    // Delete pending user (no longer needed)
    await PendingUserModel.deleteOne({ _id: pendingUser._id });

    // Send welcome email (only for customers)
    if (user.role === "customer") {
      await sendWelcomeEmail(user.email, user.name);
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[Email Verification] ✅ User created in database after verification");
      console.log("[Email Verification] User email:", user.email);
      console.log("[Email Verification] Pending user deleted");
      console.log("[Email Verification] Welcome email sent");
    }

    return NextResponse.json(
      {
        message: "تم تأكيد البريد الإلكتروني وإنشاء الحساب بنجاح",
        verified: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ أثناء تأكيد البريد الإلكتروني" },
      { status: 500 }
    );
  }
}

