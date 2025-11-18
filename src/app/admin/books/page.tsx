import { requireAdmin } from "@/lib/adminAuth";
import { getAllBooks } from "@/lib/services/bookService";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { BooksTable } from "@/components/admin/books/BooksTable";

export default async function AdminBooksPage() {
  await requireAdmin();
  const books = await getAllBooks();

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <div className="flex flex-1 flex-col lg:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <BooksTable initialBooks={books as any} />
        </main>
      </div>
    </div>
  );
}


















