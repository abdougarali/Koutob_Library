import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllOrders, createOrder } from "@/lib/services/orderService";
import { orderInputSchema } from "@/lib/validators/orderValidator";
import { sendOrderConfirmationEmail } from "@/lib/services/emailService";
import { dbConnect } from "@/lib/dbConnect";
import { NewsletterSubscriberModel } from "@/lib/models/NewsletterSubscriber";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const orders = await getAllOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "فشل في جلب الطلبات" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received order data:", JSON.stringify(body, null, 2));
    
    const validated = orderInputSchema.parse(body);
    console.log("Validated order data:", JSON.stringify(validated, null, 2));
    
    const order = await createOrder(validated);

    // تحويل Mongoose document إلى plain object
    const orderData = {
      orderCode: order.orderCode?.toString() || "",
      _id: order._id?.toString() || "",
    };

    // Subscribe to newsletter if opted in during checkout
    const subscribeNewsletter = (body as any).subscribeNewsletter === true || (body as any).subscribeNewsletter === "true";
    if (subscribeNewsletter && validated.email) {
      try {
        await dbConnect();
        const existingSubscriber = await NewsletterSubscriberModel.findOne({
          email: validated.email.toLowerCase().trim(),
        });

        if (!existingSubscriber) {
          await NewsletterSubscriberModel.create({
            email: validated.email.toLowerCase().trim(),
            name: validated.customerName,
            source: "checkout",
            isActive: true,
            locale: "ar",
          });
        } else if (!existingSubscriber.isActive) {
          // Reactivate if previously unsubscribed
          existingSubscriber.isActive = true;
          existingSubscriber.source = "checkout";
          existingSubscriber.subscribedAt = new Date();
          if (!existingSubscriber.name) {
            existingSubscriber.name = validated.customerName;
          }
          await existingSubscriber.save();
        }
      } catch (newsletterError: any) {
        // Log but don't fail order creation if newsletter subscription fails
        console.error("[Order API] Failed to subscribe to newsletter:", newsletterError);
      }
    }

    // Send confirmation email if email is provided
    if (validated.email) {
      try {
        await sendOrderConfirmationEmail(validated.email, {
          orderCode: order.orderCode,
          customerName: validated.customerName,
          items: validated.items.map((item) => ({
            title: item.title,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: order.subtotal,
          deliveryFees: order.deliveryFees,
          total: order.total,
          address: validated.address,
          city: validated.city,
          phone: validated.phone,
        });
        if (process.env.NODE_ENV === "development") {
          console.log(`[Order API] Confirmation email sent to ${validated.email}`);
        }
      } catch (emailError) {
        // Log email error but don't fail the order creation
        console.error("[Order API] Failed to send confirmation email:", emailError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: orderData,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating order:", error);
    console.error("Error stack:", error.stack);
    
    // Check if it's a ZodError
    if (error.name === "ZodError" || error.issues) {
      const issues = error.issues || [];
      const details = issues.map((err: any) => ({
        field: err.path?.join(".") || err.path || "unknown",
        message: err.message || "قيمة غير صحيحة",
      }));
      console.error("Validation errors:", details);
      
      // Get the first error message for user-friendly display
      const firstError = details[0];
      const errorMessage = firstError 
        ? `${firstError.field}: ${firstError.message}`
        : "بيانات غير صحيحة";
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: details,
        },
        { status: 400 },
      );
    }
    
    // إرجاع رسالة خطأ أكثر تفصيلاً
    const errorMessage = error.message || "فشل في إنشاء الطلب";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}

