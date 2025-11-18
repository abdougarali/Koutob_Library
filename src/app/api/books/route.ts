import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllBooks, createBook } from "@/lib/services/bookService";
import { bookInputSchema } from "@/lib/validators/bookValidator";

// Cache GET requests for 60 seconds
export const revalidate = 60;

export async function GET() {
  try {
    const books = await getAllBooks();
    const response = NextResponse.json(books);
    
    // Add caching headers
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120"
    );
    
    return response;
  } catch (error: any) {
    console.error("Error fetching books:", error);
    
    // Handle specific error types
    if (error.name === "MongoServerError" || error.name === "MongooseError") {
      return NextResponse.json(
        { error: "خطأ في الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً." },
        { status: 503 },
      );
    }
    
    return NextResponse.json(
      { error: "فشل في جلب الكتب. يرجى المحاولة مرة أخرى." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const validated = bookInputSchema.parse(body);
    const book = await createBook(validated);

    return NextResponse.json(book, { status: 201 });
  } catch (error: any) {
    console.error("Error creating book:", error);
    
    // Handle validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "بيانات غير صحيحة", details: error.issues },
        { status: 400 },
      );
    }
    
    // Handle duplicate key errors (e.g., duplicate slug)
    if (error.code === 11000 || error.name === "MongoServerError") {
      const field = Object.keys(error.keyPattern || {})[0] || "حقل";
      return NextResponse.json(
        { error: `هذا ${field === "slug" ? "الرابط" : field} مستخدم بالفعل. يرجى اختيار قيمة أخرى.` },
        { status: 409 },
      );
    }
    
    // Handle database connection errors
    if (error.name === "MongooseError") {
      return NextResponse.json(
        { error: "خطأ في الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً." },
        { status: 503 },
      );
    }
    
    return NextResponse.json(
      { error: "فشل في إنشاء الكتاب. يرجى التحقق من البيانات والمحاولة مرة أخرى." },
      { status: 500 },
    );
  }
}




