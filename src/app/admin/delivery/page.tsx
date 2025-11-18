import { requireAdmin } from "@/lib/adminAuth";
import { getAllDeliveryPartners } from "@/lib/services/deliveryService";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DeliveryPartnersTable } from "@/components/admin/delivery/DeliveryPartnersTable";

export default async function AdminDeliveryPage() {
  await requireAdmin();
  const partners = await getAllDeliveryPartners();

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <div className="flex flex-1 flex-col lg:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <DeliveryPartnersTable initialPartners={partners as any} />
        </main>
      </div>
    </div>
  );
}


















