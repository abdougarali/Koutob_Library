import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/dbConnect";
import { ContactMessageModel } from "@/lib/models/ContactMessage";
import { contactMessageSchema } from "@/lib/validators/contactValidator";
import { sendContactMessageEmail } from "@/lib/services/emailServiceSMTP";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validated = contactMessageSchema.parse(body);
    
    await dbConnect();
    
    // Save message to database
    const message = await ContactMessageModel.create({
      name: validated.name.trim(),
      email: validated.email.trim().toLowerCase(),
      subject: validated.subject.trim(),
      message: validated.message.trim(),
      isRead: false,
    });

    // Send email notification to admin
    try {
      await sendContactMessageEmail({
        name: validated.name,
        email: validated.email,
        subject: validated.subject,
        message: validated.message,
      });
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error("Error sending contact email:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.",
        id: message._id.toString(),
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error processing contact message:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "بيانات غير صحيحة",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.",
      },
      { status: 500 },
    );
  }
}

