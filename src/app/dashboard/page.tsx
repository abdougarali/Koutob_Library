import { requireAuth } from "@/lib/adminAuth";
import { getCustomerOrders } from "@/lib/services/orderService";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import { CustomerDashboardClient } from "@/components/customer/CustomerDashboardClient";

export default async function CustomerDashboardPage() {
  const session = await requireAuth();
  
  // Only customers can access this page
  if (session.user.role !== "customer") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-600">غير مصرح - هذه الصفحة للعملاء فقط</p>
      </div>
    );
  }

  // Get customer orders
  const orders = await getCustomerOrders(session.user.email, undefined);

  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--color-surface-muted)]/40">
      <CustomerHeader />
      <div className="flex flex-1 flex-col lg:flex-row">
        <CustomerSidebar />
        <main className="flex-1 bg-transparent">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <CustomerDashboardClient
              user={session.user}
              initialOrders={orders as any}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

















