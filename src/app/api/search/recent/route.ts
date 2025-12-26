import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentSearches } from "@/lib/services/searchService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Try to get sessionId from cookie or header
    const sessionId = request.cookies.get("sessionId")?.value || 
                      request.headers.get("x-session-id") || 
                      undefined;

    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10", 10);

    const recentSearches = await getRecentSearches(userId, sessionId, limit);

    return NextResponse.json({
      success: true,
      searches: recentSearches,
    });
  } catch (error: any) {
    console.error("Get recent searches error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "فشل جلب عمليات البحث الأخيرة",
      },
      { status: 500 },
    );
  }
}



















