import type { Metadata } from "next";
import { CheckoutPageClient } from "@/components/checkout/CheckoutPageClient";

export const metadata: Metadata = {
  title: "إتمام الطلب | مكتبة كتب الإسلامية",
  description:
    "أكمل بياناتك الشخصية وعنوان التوصيل لتأكيد الطلب والدفع نقداً عند الاستلام.",
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}



















