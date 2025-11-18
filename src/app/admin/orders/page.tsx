import { requireAdmin } from "@/lib/adminAuth";
import { getAllOrders } from "@/lib/services/orderService";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getAllOrders();

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <div className="flex flex-1 flex-col lg:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <OrdersTable initialOrders={orders} />
        </main>
      </div>
    </div>
  );
}

