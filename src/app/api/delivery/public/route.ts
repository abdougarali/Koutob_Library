import { NextResponse } from "next/server";
import { listDeliveryPartners } from "@/lib/services/deliveryService";

// Cache GET requests for 5 minutes (delivery partners don't change often)
export const revalidate = 300;

// Public endpoint to get active delivery partners (for checkout page)
export async function GET() {
  try {
    const partners = await listDeliveryPartners({ isActive: true });
    const response = NextResponse.json(partners);
    
    // Add caching headers
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );
    
    return response;
  } catch (error) {
    console.error("Error fetching delivery partners:", error);
    return NextResponse.json(
      { error: "فشل في جلب شركاء التوصيل" },
      { status: 500 },
    );
  }
}

