import { requireAdmin } from "@/lib/adminAuth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { NewsletterManager } from "@/components/admin/newsletter/NewsletterManager";

export default async function AdminNewsletterPage() {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <div className="flex flex-1 flex-col lg:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <NewsletterManager />
        </main>
      </div>
    </div>
  );
}


