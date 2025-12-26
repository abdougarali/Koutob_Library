import type { Metadata } from "next";
import { OrderTrackClient } from "@/components/orders/OrderTrackClient";

export const metadata: Metadata = {
  title: "تتبع الطلب | مكتبة الفاروق",
  description:
    "تحقق من حالة طلبك وخطوات التوصيل الحالية عبر إدخال رقم الطلب أو رقم الهاتف.",
};

type OrderTrackPageProps = {
  searchParams: Promise<{
    code?: string;
  }>;
};

export default async function OrderTrackPage({
  searchParams,
}: OrderTrackPageProps) {
  const { code } = await searchParams;
  return <OrderTrackClient initialCode={code} />;
}



















