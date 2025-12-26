import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { NewsletterSubscriberModel } from "@/lib/models/NewsletterSubscriber";
import { sendEmail } from "@/lib/services/emailService";
import { syncSubscriberToESP } from "@/lib/services/espService";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  name: z.string().max(140).optional(),
  source: z.enum(["footer", "signup", "checkout"]).default("footer"),
  interests: z.array(z.string().max(50)).optional(),
  locale: z.string().max(10).optional(),
  tags: z.array(z.string().max(50)).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = subscribeSchema.parse(body);

    await dbConnect();

    // Check if already subscribed
    const existing = await NewsletterSubscriberModel.findOne({
      email: validated.email.toLowerCase().trim(),
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: "أنت مشترك بالفعل في النشرة الإخبارية" },
          { status: 400 },
        );
      } else {
        // Reactivate subscription
        existing.isActive = true;
        existing.subscribedAt = new Date();
        if (validated.name) {
          existing.name = validated.name.trim();
        }
        // Update source and additional fields if provided
        if (validated.source) {
          existing.source = validated.source;
        }
        if (validated.interests && validated.interests.length > 0) {
          existing.interests = validated.interests;
        }
        if (validated.locale) {
          existing.locale = validated.locale;
        }
        if (validated.tags && validated.tags.length > 0) {
          existing.tags = validated.tags;
        }
        await existing.save();

        // Sync to ESP (Brevo)
        try {
          const tags = [
            existing.source,
            existing.locale || "ar",
            ...(existing.interests || []),
          ];

          const syncResult = await syncSubscriberToESP(
            existing.email,
            existing.name || undefined,
            existing.source,
            tags,
          );

          if (syncResult.success) {
            existing.espStatus = "synced";
            existing.espContactId = syncResult.espContactId;
            existing.espLastSyncedAt = new Date();
            existing.espSyncError = undefined;
          } else {
            existing.espStatus = "error";
            existing.espSyncError = syncResult.error;
          }
          await existing.save();
        } catch (syncError) {
          // Don't fail subscription if ESP sync fails
          console.error("[Newsletter] ESP sync failed:", syncError);
          existing.espStatus = "error";
          existing.espSyncError = String(syncError);
          await existing.save();
        }

        // Send welcome email
        await sendEmail({
          to: existing.email,
          subject: "مرحباً بك مرة أخرى في نشرتنا الإخبارية",
          html: `
            <h1>مرحباً بك مرة أخرى!</h1>
            <p>شكراً لإعادة الاشتراك في نشرتنا الإخبارية.</p>
            <p>ستتلقى آخر الأخبار عن الكتب الجديدة والعروض الخاصة.</p>
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || ""}/newsletter/unsubscribe?token=${existing.unsubscribeToken}">إلغاء الاشتراك</a></p>
          `,
        });

        return NextResponse.json({
          success: true,
          message: "تم إعادة تفعيل الاشتراك بنجاح",
        });
      }
    }

    // Create new subscriber
    const subscriber = await NewsletterSubscriberModel.create({
      email: validated.email.toLowerCase().trim(),
      name: validated.name?.trim(),
      isActive: true,
      source: validated.source || "footer",
      interests: validated.interests || [],
      locale: validated.locale || "ar",
      tags: validated.tags || [],
      espStatus: "pending", // Will be updated after sync
    });

    // Sync to ESP (Brevo)
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
      // Don't fail subscription if ESP sync fails
      console.error("[Newsletter] ESP sync failed:", syncError);
      subscriber.espStatus = "error";
      subscriber.espSyncError = String(syncError);
      await subscriber.save();
    }

    // Send welcome email
    await sendEmail({
      to: subscriber.email,
      subject: "مرحباً بك في نشرتنا الإخبارية",
      html: `
        <h1>مرحباً بك في مكتبة الفاروق!</h1>
        <p>شكراً لاشتراكك في نشرتنا الإخبارية.</p>
        <p>ستتلقى آخر الأخبار عن:</p>
        <ul>
          <li>الكتب الجديدة</li>
          <li>العروض الخاصة والخصومات</li>
          <li>أحدث الإصدارات</li>
        </ul>
        <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || ""}/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}">إلغاء الاشتراك</a></p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "تم الاشتراك بنجاح! تحقق من بريدك الإلكتروني",
    });
  } catch (error: any) {
    console.error("Error subscribing to newsletter:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: error.issues?.[0]?.message || "بيانات غير صحيحة",
        },
        { status: 400 },
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "أنت مشترك بالفعل في النشرة الإخبارية" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "حدث خطأ أثناء الاشتراك. يرجى المحاولة مرة أخرى." },
      { status: 500 },
    );
  }
}





