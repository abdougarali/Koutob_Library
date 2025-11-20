import { sendEmailSMTP } from "./emailServiceSMTP";

// Check if SMTP is configured
const isSMTPConfigured = !!(
  process.env.SMTP_USER &&
  process.env.SMTP_PASSWORD &&
  process.env.SMTP_HOST
);

// Log configuration status (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("[Email Service] Configuration check:");
  console.log("  - SMTP_HOST:", process.env.SMTP_HOST || "NOT SET");
  console.log("  - SMTP_USER:", process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 5)}...` : "NOT SET");
  console.log("  - SMTP_PASSWORD:", process.env.SMTP_PASSWORD ? "Set" : "NOT SET");
  console.log("  - SMTP Configured:", isSMTPConfigured ? "✅ Yes" : "❌ No");
  
  if (!isSMTPConfigured) {
    console.warn("[Email Service] ⚠️ SMTP not configured - emails will not be sent");
    console.warn("[Email Service] Please configure SMTP settings in .env.local");
  } else {
    console.log("[Email Service] ✅ SMTP configured - emails will be sent via SMTP");
  }
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Use SMTP only
  if (!isSMTPConfigured) {
    console.warn("[Email Service] SMTP not configured. Email not sent.");
    console.log("[Email Service] Would send email to:", options.to);
    console.log("[Email Service] Subject:", options.subject);
    console.log("[Email Service] HTML content:", options.html.substring(0, 100) + "...");
    return false;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[Email Service] Using SMTP to send email");
  }

  return sendEmailSMTP(options);
}

const LOCAL_FALLBACK_URL = "http://localhost:3002";

function getAppBaseUrl(): string {
  const trimmed = (value?: string | null) => value?.trim();

  return (
    trimmed(process.env.NEXT_PUBLIC_SITE_URL) ||
    trimmed(process.env.NEXT_PUBLIC_BASE_URL) ||
    trimmed(process.env.NEXTAUTH_URL) ||
    (trimmed(process.env.VERCEL_URL) ? `https://${trimmed(process.env.VERCEL_URL)}` : undefined) ||
    LOCAL_FALLBACK_URL
  );
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName?: string
): Promise<boolean> {
  const baseUrl = getAppBaseUrl();
  const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>إعادة تعيين كلمة المرور</title>
    </head>
    <body style="font-family: 'Tajawal', Arial, sans-serif; direction: rtl; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #0a6e5c; text-align: center; margin-bottom: 20px;">إعادة تعيين كلمة المرور</h1>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          مرحباً ${userName || "عزيزي المستخدم"}،
        </p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك. إذا كنت أنت من طلب هذا، يرجى النقر على الزر أدناه لإعادة تعيين كلمة المرور:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #0a6e5c; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            إعادة تعيين كلمة المرور
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          أو يمكنك نسخ الرابط التالي ولصقه في المتصفح:
        </p>
        <p style="color: #0a6e5c; font-size: 12px; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
          ${resetUrl}
        </p>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
          <strong>ملاحظة مهمة:</strong> هذا الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني بأمان.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          مكتبة كتب الإسلامية | Koutob
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "إعادة تعيين كلمة المرور - مكتبة كتب الإسلامية",
    html,
  });
}

export async function sendVerificationEmail(
  email: string,
  verificationToken: string,
  userName?: string
): Promise<boolean> {
  const baseUrl = getAppBaseUrl();
  const verificationUrl = `${baseUrl}/verify-email/${verificationToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تأكيد البريد الإلكتروني</title>
    </head>
    <body style="font-family: 'Tajawal', Arial, sans-serif; direction: rtl; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #0a6e5c; text-align: center; margin-bottom: 20px;">تأكيد البريد الإلكتروني</h1>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          مرحباً ${userName || "عزيزي المستخدم"}،
        </p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          شكراً لك على التسجيل في مكتبة كتب الإسلامية! يرجى النقر على الزر أدناه لتأكيد بريدك الإلكتروني:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="display: inline-block; background-color: #0a6e5c; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            تأكيد البريد الإلكتروني
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          أو يمكنك نسخ الرابط التالي ولصقه في المتصفح:
        </p>
        <p style="color: #0a6e5c; font-size: 12px; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
          ${verificationUrl}
        </p>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
          <strong>ملاحظة مهمة:</strong> هذا الرابط صالح لمدة 24 ساعة. إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد الإلكتروني بأمان.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          مكتبة كتب الإسلامية | Koutob
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "تأكيد البريد الإلكتروني - مكتبة كتب الإسلامية",
    html,
  });
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderData: {
    orderCode: string;
    customerName: string;
    items: Array<{ title: string; quantity: number; price: number }>;
    subtotal: number;
    deliveryFees: number;
    total: number;
    address: string;
    city: string;
    phone: string;
  }
): Promise<boolean> {
  const baseUrl = getAppBaseUrl();
  const itemsHtml = orderData.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">${item.price.toLocaleString("ar-TN", { style: "currency", currency: "TND" })}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">${(item.price * item.quantity).toLocaleString("ar-TN", { style: "currency", currency: "TND" })}</td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تأكيد الطلب</title>
    </head>
    <body style="font-family: 'Tajawal', Arial, sans-serif; direction: rtl; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #0a6e5c; text-align: center; margin-bottom: 20px;">✅ تم تأكيد طلبك</h1>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          مرحباً ${orderData.customerName}،
        </p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          شكراً لك على طلبك! تم استلام طلبك بنجاح وسيتم معالجته قريباً.
        </p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #0a6e5c;">
            رقم الطلب: ${orderData.orderCode}
          </p>
        </div>
        
        <h2 style="color: #333; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">تفاصيل الطلب:</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #0a6e5c; color: white;">
              <th style="padding: 10px; text-align: right;">الكتاب</th>
              <th style="padding: 10px; text-align: center;">الكمية</th>
              <th style="padding: 10px; text-align: left;">السعر</th>
              <th style="padding: 10px; text-align: left;">المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="border-top: 2px solid #0a6e5c; padding-top: 15px; margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-weight: bold;">المجموع الفرعي:</span>
            <span>${orderData.subtotal.toLocaleString("ar-TN", { style: "currency", currency: "TND" })}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-weight: bold;">رسوم التوصيل:</span>
            <span>${orderData.deliveryFees.toLocaleString("ar-TN", { style: "currency", currency: "TND" })}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #0a6e5c; margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
            <span>المجموع الكلي:</span>
            <span>${orderData.total.toLocaleString("ar-TN", { style: "currency", currency: "TND" })}</span>
          </div>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #333; font-size: 16px; margin-top: 0; margin-bottom: 10px;">عنوان التوصيل:</h3>
          <p style="margin: 5px 0; color: #666;">
            <strong>المدينة:</strong> ${orderData.city}
          </p>
          <p style="margin: 5px 0; color: #666;">
            <strong>العنوان:</strong> ${orderData.address}
          </p>
          <p style="margin: 5px 0; color: #666;">
            <strong>الهاتف:</strong> ${orderData.phone}
          </p>
        </div>
        
        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 6px; margin: 20px 0; border-right: 4px solid #0a6e5c;">
          <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">
            <strong>ملاحظة:</strong> سيتم التواصل معك عبر الهاتف لتأكيد الطلب. الدفع يتم نقداً عند الاستلام.
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
          يمكنك متابعة حالة طلبك من خلال الرابط التالي:
        </p>
        <p style="color: #0a6e5c; font-size: 12px; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
          ${baseUrl}/orders/track?code=${orderData.orderCode}
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          مكتبة كتب الإسلامية | Koutob
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `تأكيد الطلب #${orderData.orderCode} - مكتبة كتب الإسلامية`,
    html,
  });
}

export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3002";
  
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>مرحباً بك في مكتبة كتب الإسلامية</title>
    </head>
    <body style="font-family: 'Tajawal', Arial, sans-serif; direction: rtl; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #0a6e5c; text-align: center; margin-bottom: 20px;">🎉 مرحباً بك!</h1>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          مرحباً ${userName}،
        </p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          شكراً لك على الانضمام إلى مكتبة كتب الإسلامية! نحن سعداء جداً بوجودك معنا.
        </p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          الآن يمكنك:
        </p>
        
        <ul style="color: #333; font-size: 16px; line-height: 1.8; padding-right: 20px;">
          <li>تصفح مجموعتنا الواسعة من الكتب الإسلامية</li>
          <li>تتبع طلباتك بسهولة</li>
          <li>إدارة ملفك الشخصي وعناوينك</li>
          <li>الحصول على آخر العروض والكتب الجديدة</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/books" style="display: inline-block; background-color: #0a6e5c; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            تصفح المكتبة
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
          إذا كان لديك أي أسئلة، لا تتردد في التواصل معنا. نحن هنا لمساعدتك!
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          مكتبة كتب الإسلامية | Koutob
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "مرحباً بك في مكتبة كتب الإسلامية!",
    html,
  });
}

export async function sendOrderStatusUpdateEmail(
  email: string,
  orderData: {
    orderCode: string;
    customerName: string;
    status: string;
    note?: string;
  }
): Promise<boolean> {
  const baseUrl = getAppBaseUrl();
  const statusMessages: Record<string, { title: string; message: string; color: string }> = {
    "قيد المعالجة": {
      title: "قيد المعالجة",
      message: "تم استلام طلبك وهو قيد المعالجة حالياً. سنتواصل معك قريباً لتأكيد التفاصيل.",
      color: "#ff9800",
    },
    "تم الإرسال": {
      title: "تم الإرسال",
      message: "تم إرسال طلبك! سيتم التواصل معك قريباً لتحديد موعد التوصيل.",
      color: "#2196f3",
    },
    "تم التسليم": {
      title: "تم التسليم",
      message: "تم تسليم طلبك بنجاح! نأمل أن تكون راضياً عن خدمتنا.",
      color: "#4caf50",
    },
    "تم الإلغاء": {
      title: "تم الإلغاء",
      message: "تم إلغاء طلبك. إذا كان لديك أي استفسار، يرجى التواصل معنا.",
      color: "#f44336",
    },
  };

  const statusInfo = statusMessages[orderData.status] || {
    title: orderData.status,
    message: "تم تحديث حالة طلبك.",
    color: "#666",
  };

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تحديث حالة الطلب</title>
    </head>
    <body style="font-family: 'Tajawal', Arial, sans-serif; direction: rtl; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: ${statusInfo.color}; text-align: center; margin-bottom: 20px;">تحديث حالة الطلب</h1>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          مرحباً ${orderData.customerName}،
        </p>
        
        <div style="background-color: ${statusInfo.color}15; border-right: 4px solid ${statusInfo.color}; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${statusInfo.color};">
            حالة الطلب: ${statusInfo.title}
          </p>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          ${statusInfo.message}
        </p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 16px; font-weight: bold; color: #0a6e5c;">
            رقم الطلب: ${orderData.orderCode}
          </p>
        </div>
        
        ${orderData.note ? `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-right: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
              <strong>ملاحظة:</strong> ${orderData.note}
            </p>
          </div>
        ` : ""}
        
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
          يمكنك متابعة حالة طلبك من خلال الرابط التالي:
        </p>
        <p style="color: #0a6e5c; font-size: 12px; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
          ${baseUrl}/orders/track?code=${orderData.orderCode}
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          مكتبة كتب الإسلامية | Koutob
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `تحديث حالة الطلب #${orderData.orderCode} - مكتبة كتب الإسلامية`,
    html,
  });
}
