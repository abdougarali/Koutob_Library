import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getBookBySlug,
  updateBook,
  deleteBook,
} from "@/lib/services/bookService";
import { bookInputSchema } from "@/lib/validators/bookValidator";

// Cache GET requests for 60 seconds
export const revalidate = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const book = await getBookBySlug(decodedSlug);
    if (!book) {
      return NextResponse.json({ error: "الكتاب غير موجود" }, { status: 404 });
    }
    
    const response = NextResponse.json(book);
    
    // Add caching headers
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120"
    );
    
    return response;
  } catch (error: any) {
    console.error("Error fetching book:", error);
    
    // Handle invalid ObjectId or malformed slug
    if (error.name === "CastError" || error.name === "BSONTypeError") {
      return NextResponse.json(
        { error: "معرف الكتاب غير صحيح" },
        { status: 400 },
      );
    }
    
    // Handle database errors
    if (error.name === "MongoServerError" || error.name === "MongooseError") {
      return NextResponse.json(
        { error: "خطأ في الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً." },
        { status: 503 },
      );
    }
    
    return NextResponse.json(
      { error: "فشل في جلب الكتاب. يرجى المحاولة مرة أخرى." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const body = await request.json();
    const validated = bookInputSchema.partial().parse(body);
    const book = await updateBook(decodedSlug, validated);

    if (!book) {
      return NextResponse.json({ error: "الكتاب غير موجود" }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error: any) {
    console.error("Error updating book:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "بيانات غير صحيحة", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "فشل في تحديث الكتاب" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const book = await deleteBook(decodedSlug);

    if (!book) {
      return NextResponse.json({ error: "الكتاب غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ message: "تم حذف الكتاب نهائياً من قاعدة البيانات" });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { error: "فشل في حذف الكتاب" },
      { status: 500 },
    );
  }
}




