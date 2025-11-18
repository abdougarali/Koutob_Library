import { Suspense } from "react";
import OrderConfirmationClient from "@/components/orders/OrderConfirmationClient";

export default function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <OrderConfirmationWrapper searchParams={searchParams} />
    </Suspense>
  );
}

async function OrderConfirmationWrapper({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  const code = params.code || "";

  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16">
      <OrderConfirmationClient initialCode={code} />
    </section>
  );
}



















