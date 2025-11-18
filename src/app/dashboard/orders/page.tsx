import { requireAuth } from "@/lib/adminAuth";
import { getCustomerOrders } from "@/lib/services/orderService";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import { CustomerOrdersClient } from "@/components/customer/CustomerOrdersClient";

export default async function CustomerOrdersPage() {
  const session = await requireAuth();
  
  if (session.user.role !== "customer") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-600">غير مصرح - هذه الصفحة للعملاء فقط</p>
      </div>
    );
  }

  const orders = await getCustomerOrders(session.user.email, undefined);

  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--color-surface-muted)]/40">
      <CustomerHeader />
      <div className="flex flex-1 flex-col lg:flex-row">
        <CustomerSidebar />
        <main className="flex-1 bg-transparent">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <CustomerOrdersClient orders={orders as any} />
          </div>
        </main>
      </div>
    </div>
  );
}

















