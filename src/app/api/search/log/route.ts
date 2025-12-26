import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logSearch } from "@/lib/services/searchService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    const body = await request.json();
    const { query, sessionId, clickedBookId } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "استعلام البحث مطلوب",
        },
        { status: 400 },
      );
    }

    // Log the search (non-blocking)
    await logSearch(query, userId, sessionId, clickedBookId);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    // Don't fail the request if logging fails
    console.error("Log search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "فشل تسجيل البحث",
      },
      { status: 500 },
    );
  }
}



















