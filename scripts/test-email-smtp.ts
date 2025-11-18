/**
 * Test script to verify SMTP email configuration
 * 
 * Usage: npm run test-email-smtp your@email.com
 */

import * as dotenv from "dotenv";
import { resolve } from "path";
import { sendEmailSMTP } from "../src/lib/services/emailServiceSMTP";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

async function testSMTP() {
  console.log("\n" + "=".repeat(60));
  console.log("📧 SMTP Email Configuration Test");
  console.log("=".repeat(60) + "\n");

  // Check SMTP configuration
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.error("❌ SMTP not configured in .env.local");
    console.log("\n💡 To fix:");
    console.log("1. Add SMTP configuration to .env.local:");
    console.log("\n   # Gmail SMTP (Recommended)");
    console.log("   SMTP_HOST=smtp.gmail.com");
    console.log("   SMTP_PORT=587");
    console.log("   SMTP_SECURE=false");
    console.log("   SMTP_USER=your-email@gmail.com");
    console.log("   SMTP_PASSWORD=your-app-password");
    console.log("   SMTP_FROM_EMAIL=your-email@gmail.com");
    console.log("\n2. For Gmail:");
    console.log("   - Enable 2-Step Verification");
    console.log("   - Generate App Password: https://myaccount.google.com/apppasswords");
    console.log("   - Use the 16-character app password (remove spaces)");
    console.log("\n3. Restart server and try again");
    process.exit(1);
  }

  console.log("✅ SMTP Configuration:");
  console.log("   Host:", smtpHost);
  console.log("   Port:", smtpPort || "587");
  console.log("   User:", smtpUser);
  console.log("   Password:", smtpPassword ? "Set" : "NOT SET");

  // Get test email from command line or use default
  const testEmail = process.argv[2] || process.env.TEST_EMAIL || "test@example.com";
  console.log("📬 Test email will be sent to:", testEmail);
  console.log("   (You can specify a different email: npm run test-email-smtp your@email.com)\n");

  // Send test email
  console.log("📤 Sending test email via SMTP...\n");

  try {
    const success = await sendEmailSMTP({
      to: testEmail,
      subject: "Test Email from Library Project (SMTP)",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #0a6e5c;">✅ SMTP Email Test Successful!</h1>
          <p>If you received this email, your SMTP configuration is working correctly.</p>
          <p><strong>From:</strong> ${smtpUser}</p>
          <p><strong>To:</strong> ${testEmail}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Method:</strong> SMTP (Free)</p>
        </body>
        </html>
      `,
    });

    if (!success) {
      console.error("❌ Email sending failed");
      console.error("\n💡 Common fixes:");
      console.error("   - Check SMTP_USER and SMTP_PASSWORD are correct");
      console.error("   - For Gmail: Use App Password, not regular password");
      console.error("   - Check SMTP_HOST and SMTP_PORT are correct");
      console.error("   - Make sure 2-Step Verification is enabled (for Gmail)");
      process.exit(1);
    }

    console.log("✅ Email sent successfully via SMTP!");
    console.log("   To:", testEmail);
    console.log("\n💡 Next steps:");
    console.log("   1. Check your inbox (and spam folder)");
    console.log("   2. If email received → SMTP is working! ✅");
    console.log("   3. If not received:");
    console.log("      - Check spam folder");
    console.log("      - Wait a few minutes");
    console.log("      - Verify SMTP settings in .env.local");
    console.log("\n" + "=".repeat(60) + "\n");

  } catch (error: any) {
    console.error("❌ Unexpected error:", error.message);
    console.error("   Details:", error);
    process.exit(1);
  }
}

testSMTP();












