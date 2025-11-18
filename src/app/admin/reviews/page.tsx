import { requireAdmin } from "@/lib/adminAuth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminReviewsClient } from "@/components/admin/reviews/AdminReviewsClient";

export default async function AdminReviewsPage() {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <div className="flex flex-1 flex-col lg:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">إدارة التقييمات</h1>
            <p className="mt-1 text-xs text-gray-600 sm:mt-2 sm:text-sm">
              مراجعة وموافقة أو رفض تقييمات العملاء
            </p>
          </div>
          <AdminReviewsClient />
        </main>
      </div>
    </div>
  );
}

