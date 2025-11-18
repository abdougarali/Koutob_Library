import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { NewsletterSubscriberModel } from "@/lib/models/NewsletterSubscriber";
import { sendEmail } from "@/lib/services/emailService";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  name: z.string().max(140).optional(),
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
        await existing.save();

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
    });

    // Send welcome email
    await sendEmail({
      to: subscriber.email,
      subject: "مرحباً بك في نشرتنا الإخبارية",
      html: `
        <h1>مرحباً بك في مكتبة كتب الإسلامية!</h1>
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
          error: error.errors?.[0]?.message || "بيانات غير صحيحة",
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





