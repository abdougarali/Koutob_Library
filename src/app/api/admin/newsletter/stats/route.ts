import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { NewsletterSubscriberModel } from "@/lib/models/NewsletterSubscriber";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    // Get total subscribers
    const totalSubscribers = await NewsletterSubscriberModel.countDocuments({
      isActive: true,
    });

    // Get total all-time subscribers (including inactive)
    const totalAllTime = await NewsletterSubscriberModel.countDocuments({});

    // Get 7-day trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const subscribersLast7Days = await NewsletterSubscriberModel.countDocuments({
      subscribedAt: { $gte: sevenDaysAgo },
      isActive: true,
    });

    // Get subscribers by source
    const bySource = await NewsletterSubscriberModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
    ]);

    const sourceBreakdown = {
      footer: 0,
      signup: 0,
      checkout: 0,
    };

    bySource.forEach((item) => {
      const source = item._id || "footer";
      if (source in sourceBreakdown) {
        sourceBreakdown[source as keyof typeof sourceBreakdown] = item.count;
      }
    });

    // Get growth rate (7-day vs previous 7 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const previous7Days = await NewsletterSubscriberModel.countDocuments({
      subscribedAt: {
        $gte: fourteenDaysAgo,
        $lt: sevenDaysAgo,
      },
      isActive: true,
    });

    const growthRate =
      previous7Days > 0
        ? ((subscribersLast7Days - previous7Days) / previous7Days) * 100
        : subscribersLast7Days > 0
          ? 100
          : 0;

    return NextResponse.json({
      total: totalSubscribers,
      totalAllTime,
      last7Days: subscribersLast7Days,
      previous7Days,
      growthRate: Math.round(growthRate * 100) / 100,
      bySource: sourceBreakdown,
    });
  } catch (error: any) {
    console.error("Error fetching newsletter stats:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الإحصائيات" },
      { status: 500 },
    );
  }
}


