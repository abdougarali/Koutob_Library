import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import { OrderModel } from "@/lib/models/Order";

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Escape quotes by doubling them and wrap in quotes if contains comma/newline/quote
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") || undefined;
    const from = searchParams.get("from") || undefined; // ISO date
    const to = searchParams.get("to") || undefined; // ISO date
    const format = (searchParams.get("format") || "csv").toLowerCase();

    const query: any = {};
    if (status) query.status = status;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const orders = await OrderModel.find(query)
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();

    const header = [
      "orderCode",
      "createdAt",
      "status",
      "customerName",
      "phone",
      "email",
      "city",
      "address",
      "subtotal",
      "deliveryFees",
      "total",
      "paymentMethod",
      "items",
      "notes",
    ];

    const rows = orders.map((o: any) => {
      const itemsText = Array.isArray(o.items)
        ? o.items
            .map(
              (it: any) =>
                `${it.title || ""} x${it.quantity ?? 0} @ ${Number(it.price ?? 0).toFixed(3)}`
            )
            .join(" | ")
        : "";
      return [
        toCsvValue(o.orderCode),
        toCsvValue(o.createdAt ? new Date(o.createdAt).toISOString() : ""),
        toCsvValue(o.status),
        toCsvValue(o.customerName),
        toCsvValue(o.phone),
        toCsvValue(o.email || ""),
        toCsvValue(o.city),
        toCsvValue(o.address),
        toCsvValue(Number(o.subtotal ?? 0).toFixed(3)),
        toCsvValue(Number(o.deliveryFees ?? 0).toFixed(3)),
        toCsvValue(Number(o.total ?? 0).toFixed(3)),
        toCsvValue(o.paymentMethod || ""),
        toCsvValue(itemsText),
        toCsvValue(o.notes || ""),
      ].join(",");
    });

    const csvContent = [header.join(","), ...rows].join("\n");
    const bom = "\ufeff"; // UTF-8 BOM
    const body = bom + csvContent;

    const datePart = new Date().toISOString().slice(0, 10);
    const filename =
      format === "txt" ? `orders-${datePart}.txt` : `orders-${datePart}.csv`;
    const contentType =
      format === "txt"
        ? "text/plain; charset=utf-8"
        : "text/csv; charset=utf-8";

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Orders export error:", error);
    return NextResponse.json({ error: "Failed to export orders" }, { status: 500 });
  }
}


