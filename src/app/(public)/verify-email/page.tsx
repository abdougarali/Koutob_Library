import type { Metadata } from "next";
import { VerifyEmailContent } from "@/components/VerifyEmailContent";

export const metadata: Metadata = {
  title: "تأكيد البريد الإلكتروني | مكتبة الفاروق",
  description: "يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك",
};

export default function VerifyEmailPage() {
  return <VerifyEmailContent />;
}

