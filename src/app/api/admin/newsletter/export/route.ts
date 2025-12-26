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

    // Fetch subscribers
    const subscribers = await NewsletterSubscriberModel.find(query)
      .sort({ subscribedAt: -1 })
      .lean();

    // Convert to CSV
    const headers = [
      "البريد الإلكتروني",
      "الاسم",
      "المصدر",
      "الحالة",
      "تاريخ الاشتراك",
      "الاهتمامات",
      "اللغة",
      "العلامات",
    ];

    const rows = subscribers.map((sub) => {
      return [
        sub.email || "",
        sub.name || "",
        sub.source || "footer",
        sub.isActive ? "نشط" : "غير نشط",
        sub.subscribedAt
          ? new Date(sub.subscribedAt).toLocaleDateString("ar-TN")
          : "",
        (sub.interests || []).join(", "),
        sub.locale || "ar",
        (sub.tags || []).join(", "),
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    // Add BOM for Excel UTF-8 support
    const BOM = "\uFEFF";
    const csvWithBOM = BOM + csvContent;

    return new NextResponse(csvWithBOM, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting newsletter subscribers:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تصدير البيانات" },
      { status: 500 },
    );
  }
}


