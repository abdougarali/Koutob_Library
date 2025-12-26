import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCustomerOrders } from "@/lib/services/orderService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only customers can access their own orders
    if (!session || session.user.role !== "customer") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // Get customer orders by email
    const orders = await getCustomerOrders(session.user.email, undefined);
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { error: "فشل في جلب الطلبات" },
      { status: 500 },
    );
  }
}


































