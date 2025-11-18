import { requireAuth } from "@/lib/adminAuth";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import { WishlistClient } from "@/components/wishlist/WishlistClient";

export default async function WishlistPage() {
  const session = await requireAuth();
  
  // Only customers can access this page
  if (session.user.role !== "customer") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-600">غير مصرح - هذه الصفحة للعملاء فقط</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CustomerHeader />
      <div className="flex flex-1">
        <CustomerSidebar />
        <main className="flex-1 p-8">
          <WishlistClient />
        </main>
      </div>
    </div>
  );
}




