import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getLowStockBooks } from "@/lib/services/stockAlertService";

export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const books = await getLowStockBooks(limit);

    const response = NextResponse.json({
      success: true,
      books,
    });

    // Add caching headers
    response.headers.set(
      "Cache-Control",
      "private, s-maxage=60, stale-while-revalidate=120",
    );

    return response;
  } catch (error: any) {
    console.error("Error fetching low stock books:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الكتب قليلة المخزون" },
      { status: 500 },
    );
  }
}





