import { NextRequest, NextResponse } from "next/server";
import { getRelatedBooks } from "@/lib/services/recommendationService";
import { getBookBySlug } from "@/lib/services/bookService";

export const revalidate = 60; // Cache for 60 seconds

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // Get the current book to extract category and author
    const currentBook = await getBookBySlug(decodedSlug);

    if (!currentBook) {
      return NextResponse.json(
        { error: "الكتاب غير موجود" },
        { status: 404 },
      );
    }

    // Get limit from query params (default: 6)
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "6", 10);

    // Get related books
    const relatedBooks = await getRelatedBooks(
      decodedSlug,
      currentBook.category || "",
      currentBook.author || "",
      limit,
    );

    const response = NextResponse.json({
      success: true,
      books: relatedBooks,
    });

    // Add caching headers
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120",
    );

    return response;
  } catch (error: any) {
    console.error("Error fetching related books:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الكتب المشابهة" },
      { status: 500 },
    );
  }
}





