import { NextRequest, NextResponse } from "next/server";
import { getPopularSearches } from "@/lib/services/searchService";

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10", 10);
    const days = parseInt(request.nextUrl.searchParams.get("days") || "30", 10);

    const popularSearches = await getPopularSearches(limit, days);

    return NextResponse.json({
      success: true,
      searches: popularSearches,
    });
  } catch (error: any) {
    console.error("Get popular searches error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "فشل جلب عمليات البحث الشائعة",
      },
      { status: 500 },
    );
  }
}



















