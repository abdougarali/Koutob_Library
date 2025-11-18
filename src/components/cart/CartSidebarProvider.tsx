"use client";

import { CartSidebar } from "./CartSidebar";
import { useCartSidebarStore } from "@/lib/stores/cartSidebarStore";

export function CartSidebarProvider() {
  const isOpen = useCartSidebarStore((state) => state.isOpen);
  const closeSidebar = useCartSidebarStore((state) => state.closeSidebar);

  return <CartSidebar isOpen={isOpen} onClose={closeSidebar} />;
}

























