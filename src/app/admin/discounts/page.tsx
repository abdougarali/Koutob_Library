import { requireAdmin } from "@/lib/adminAuth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DiscountCodesManager } from "@/components/admin/discounts/DiscountCodesManager";
import { getAllDiscountCodes } from "@/lib/services/discountCodeService";

export default async function AdminDiscountsPage() {
  await requireAdmin();
  const discounts = await getAllDiscountCodes();

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <div className="flex flex-1 flex-col lg:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <DiscountCodesManager initialDiscounts={discounts} />
        </main>
      </div>
    </div>
  );
}








