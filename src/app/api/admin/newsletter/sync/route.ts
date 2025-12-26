import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { NewsletterSubscriberModel } from "@/lib/models/NewsletterSubscriber";
import { syncSubscriberToESP } from "@/lib/services/espService";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    // Find all subscribers that need syncing
    const pendingSubscribers = await NewsletterSubscriberModel.find({
      $or: [{ espStatus: "pending" }, { espStatus: "error" }],
      isActive: true,
    }).limit(100); // Process 100 at a time to avoid timeout

    const results = {
      total: pendingSubscribers.length,
      synced: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Sync each subscriber
    for (const subscriber of pendingSubscribers) {
      try {
        const tags = [
          subscriber.source,
          subscriber.locale || "ar",
          ...(subscriber.interests || []),
        ];

        const syncResult = await syncSubscriberToESP(
          subscriber.email,
          subscriber.name,
          subscriber.source,
          tags,
        );

        if (syncResult.success) {
          subscriber.espStatus = "synced";
          subscriber.espContactId = syncResult.espContactId;
          subscriber.espLastSyncedAt = new Date();
          subscriber.espSyncError = undefined;
          results.synced++;
        } else {
          subscriber.espStatus = "error";
          subscriber.espSyncError = syncResult.error;
          results.failed++;
          results.errors.push(
            `${subscriber.email}: ${syncResult.error || "Unknown error"}`,
          );
        }

        await subscriber.save();

        // Small delay to avoid rate limiting (100ms between calls)
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error: any) {
        results.failed++;
        results.errors.push(
          `${subscriber.email}: ${error.message || "Unknown error"}`,
        );
        console.error(
          `[Sync] Error syncing ${subscriber.email}:`,
          error,
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `تمت مزامنة ${results.synced}/${results.total} مشترك`,
      results,
    });
  } catch (error: any) {
    console.error("[Sync] Error:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء المزامنة" },
      { status: 500 },
    );
  }
}



