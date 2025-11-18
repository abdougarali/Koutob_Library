import nodemailer from "nodemailer";

// SMTP Configuration
const smtpConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Your email
    pass: process.env.SMTP_PASSWORD, // Your app password
  },
};

// Check if SMTP is configured
const isSMTPConfigured = !!(
  process.env.SMTP_USER &&
  process.env.SMTP_PASSWORD &&
  process.env.SMTP_HOST
);

// Log configuration status (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("[Email Service SMTP] Configuration check:");
  console.log("  - SMTP_HOST:", process.env.SMTP_HOST || "NOT SET");
  console.log("  - SMTP_PORT:", process.env.SMTP_PORT || "NOT SET");
  console.log("  - SMTP_USER:", process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 5)}...` : "NOT SET");
  console.log("  - SMTP_PASSWORD:", process.env.SMTP_PASSWORD ? "Set" : "NOT SET");
  console.log("  - SMTP Configured:", isSMTPConfigured ? "✅ Yes" : "❌ No");
}

// Create transporter
let transporter: nodemailer.Transporter | null = null;

if (isSMTPConfigured) {
  try {
    transporter = nodemailer.createTransport(smtpConfig);
    if (process.env.NODE_ENV === "development") {
      console.log("[Email Service SMTP] ✅ SMTP transporter created successfully");
    }
  } catch (error) {
    console.error("[Email Service SMTP] ❌ Failed to create SMTP transporter:", error);
  }
} else {
  if (process.env.NODE_ENV === "development") {
    console.warn("[Email Service SMTP] ⚠️ SMTP not configured - emails will not be sent");
  }
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmailSMTP(options: EmailOptions): Promise<boolean> {
  if (!isSMTPConfigured || !transporter) {
    console.warn("[Email Service SMTP] SMTP not configured. Email not sent.");
    console.log("[Email Service SMTP] Would send email to:", options.to);
    console.log("[Email Service SMTP] Subject:", options.subject);
    console.log("[Email Service SMTP] HTML content:", options.html.substring(0, 100) + "...");
    return false;
  }

  try {
    const fromEmail = options.from || process.env.SMTP_USER || process.env.SMTP_FROM_EMAIL || "noreply@example.com";

    console.log("[Email Service SMTP] Attempting to send email...");
    console.log("[Email Service SMTP] From:", fromEmail);
    console.log("[Email Service SMTP] To:", options.to);
    console.log("[Email Service SMTP] Subject:", options.subject);

    const info = await transporter.sendMail({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`[Email Service SMTP] ✅ Email sent successfully to ${options.to}`);
    console.log("[Email Service SMTP] Message ID:", info.messageId);
    console.log("[Email Service SMTP] Response:", info.response);

    return true;
  } catch (error: any) {
    console.error("[Email Service SMTP] ❌ Error sending email:", error);
    console.error("[Email Service SMTP] Error details:", {
      message: error?.message,
      code: error?.code,
    });

    // Common error messages and solutions
    if (error?.code === "EAUTH") {
      console.error("[Email Service SMTP] 💡 Tip: Check SMTP_USER and SMTP_PASSWORD are correct");
      console.error("[Email Service SMTP] 💡 For Gmail: Use App Password, not regular password");
    }
    if (error?.code === "ECONNECTION" || error?.code === "ETIMEDOUT") {
      console.error("[Email Service SMTP] 💡 Tip: Check SMTP_HOST and SMTP_PORT are correct");
    }

    return false;
  }
}

export async function sendPasswordResetEmailSMTP(
  email: string,
  resetToken: string,
  userName?: string
): Promise<boolean> {
  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3002"}/reset-password/${resetToken}`;

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

  return sendEmailSMTP({
    to: email,
    subject: "إعادة تعيين كلمة المرور - مكتبة كتب الإسلامية",
    html,
  });
}

export async function sendVerificationEmailSMTP(
  email: string,
  verificationToken: string,
  userName?: string
): Promise<boolean> {
  const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3002"}/verify-email/${verificationToken}`;

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

  return sendEmailSMTP({
    to: email,
    subject: "تأكيد البريد الإلكتروني - مكتبة كتب الإسلامية",
    html,
  });
}












