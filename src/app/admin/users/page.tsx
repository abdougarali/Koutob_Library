import { requireAdmin } from "@/lib/adminAuth";
import { listAllUsers } from "@/lib/services/userService";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { UsersTable } from "@/components/admin/users/UsersTable";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await listAllUsers();

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <div className="flex flex-1 flex-col lg:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <UsersTable initialUsers={users as any} />
        </main>
      </div>
    </div>
  );
}


