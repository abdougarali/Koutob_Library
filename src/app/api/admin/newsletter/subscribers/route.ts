import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { NewsletterSubscriberModel } from "@/lib/models/NewsletterSubscriber";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const isActive = searchParams.get("isActive");

    // Build query
    const query: any = {};
    if (source && ["footer", "signup", "checkout"].includes(source)) {
      query.source = source;
    }
    if (isActive !== null) {
      query.isActive = isActive === "true";
    }

    // Fetch subscribers with pagination (limit to 1000 for now)
    const subscribers = await NewsletterSubscriberModel.find(query)
      .sort({ subscribedAt: -1 })
      .limit(1000)
      .lean()
      .select(
        "email name source isActive subscribedAt interests locale tags espStatus espLastSyncedAt espSyncError",
      );

    return NextResponse.json(subscribers);
  } catch (error: any) {
    console.error("Error fetching newsletter subscribers:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المشتركين" },
      { status: 500 },
    );
  }
}


