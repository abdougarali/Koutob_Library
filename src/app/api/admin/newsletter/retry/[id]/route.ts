import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { NewsletterSubscriberModel } from "@/lib/models/NewsletterSubscriber";
import { syncSubscriberToESP } from "@/lib/services/espService";
import { requireAdmin } from "@/lib/adminAuth";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "معرف المشترك غير صحيح" },
        { status: 400 },
      );
    }

    const subscriber = await NewsletterSubscriberModel.findById(id);

    if (!subscriber) {
      return NextResponse.json(
        { error: "المشترك غير موجود" },
        { status: 404 },
      );
    }

    if (!subscriber.isActive) {
      return NextResponse.json(
        { error: "المشترك غير نشط" },
        { status: 400 },
      );
    }

    // Sync to ESP
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
      await subscriber.save();

      return NextResponse.json({
        success: true,
        message: "تمت المزامنة بنجاح",
        subscriber: {
          _id: subscriber._id.toString(),
          email: subscriber.email,
          espStatus: subscriber.espStatus,
        },
      });
    } else {
      subscriber.espStatus = "error";
      subscriber.espSyncError = syncResult.error;
      await subscriber.save();

      return NextResponse.json(
        {
          success: false,
          error: syncResult.error || "فشلت المزامنة",
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("[Retry Sync] Error:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء إعادة المحاولة" },
      { status: 500 },
    );
  }
}



