import { NextRequest, NextResponse } from "next/server";
import { autocompleteSearch } from "@/lib/services/bookService";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "8", 10);

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ success: true, results: [] });
    }

    const results = await autocompleteSearch(query.trim(), limit);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error("Autocomplete search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "فشل البحث",
      },
      { status: 500 },
    );
  }
}



















