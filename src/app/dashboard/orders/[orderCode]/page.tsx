import { requireAuth } from "@/lib/adminAuth";
import { getOrderByCode } from "@/lib/services/orderService";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import { CustomerOrderTrackingClient } from "@/components/customer/CustomerOrderTrackingClient";
import { notFound } from "next/navigation";

type CustomerOrderTrackingPageProps = {
  params: Promise<{
    orderCode: string;
  }>;
};

export default async function CustomerOrderTrackingPage({
  params,
}: CustomerOrderTrackingPageProps) {
  const session = await requireAuth();
  
  if (session.user.role !== "customer") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-600">غير مصرح - هذه الصفحة للعملاء فقط</p>
      </div>
    );
  }

  const { orderCode } = await params;
  const decodedCode = decodeURIComponent(orderCode);
  
  // Fetch order and verify it belongs to the customer
  const order = await getOrderByCode(decodedCode);
  
  if (!order) {
    notFound();
  }

  // Verify the order belongs to the logged-in customer
  // Check by email or phone
  const orderEmail = order.email?.toLowerCase().trim();
  const orderPhone = order.phone?.trim();
  const userEmail = session.user.email?.toLowerCase().trim();
  const userPhone = session.user.phone?.trim();

  const belongsToCustomer =
    (orderEmail && userEmail && orderEmail === userEmail) ||
    (orderPhone && userPhone && orderPhone === userPhone);

  if (!belongsToCustomer) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-600">غير مصرح - هذا الطلب لا ينتمي إلى حسابك</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--color-surface-muted)]/40">
      <CustomerHeader />
      <div className="flex flex-1 flex-col lg:flex-row">
        <CustomerSidebar />
        <main className="flex-1 bg-transparent">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <CustomerOrderTrackingClient order={order as any} />
          </div>
        </main>
      </div>
    </div>
  );
}





