"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartStore } from "@/lib/stores/cartStore";
import { useDiscountStore } from "@/lib/stores/discountStore";
import { calculateDiscountAmount } from "@/lib/utils/discount";

type CartItem = {
  id: string;
  title: string;
  quantity: number;
  price: number;
};

type CartViewProps = {
  initialItems: CartItem[];
};

export function CartView({ initialItems }: CartViewProps) {
  const router = useRouter();
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const setItems = useCartStore((state) => state.setItems);
  const [deliveryFees, setDeliveryFees] = useState<number>(25);
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const appliedDiscount = useDiscountStore((state) => state.appliedDiscount);
  const setDiscountInStore = useDiscountStore(
    (state) => state.setAppliedDiscount,
  );
  const clearDiscount = useDiscountStore((state) => state.clearDiscount);

  const hasSeededRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return;

    if (hasSeededRef.current) return;

    if (items.length === 0 && initialItems.length > 0) {
      setItems(
        initialItems.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
      );
    }

    hasSeededRef.current = true;
  }, [hydrated, items.length, initialItems, setItems]);

  useEffect(() => {
    let isActive = true;

    fetch("/api/delivery/public")
      .then((res) => res.json())
      .then((data) => {
        if (!isActive) return;

        if (Array.isArray(data) && data.length > 0) {
          const rawFees = data[0]?.deliveryFees;
          const parsedFees =
            typeof rawFees === "number"
              ? rawFees
              : Number(rawFees ?? 25);

          setDeliveryFees(Number.isFinite(parsedFees) ? parsedFees : 25);
        } else {
          setDeliveryFees(0);
        }
      })
      .catch((error) => {
        console.error("Error fetching delivery partners:", error);
        setDeliveryFees(25);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const computedDiscountAmount = useMemo(
    () => calculateDiscountAmount(appliedDiscount, subtotal),
    [appliedDiscount, subtotal],
  );

  const handleCheckout = useCallback(() => {
    if (items.length === 0) {
      setBannerMessage("السلة فارغة. أضف كتباً قبل إتمام الطلب.");
      return;
    }
    router.push("/checkout");
  }, [items.length, router]);

  useEffect(() => {
    if (items.length === 0 && appliedDiscount) {
      clearDiscount();
      setDiscountCodeInput("");
      setDiscountMessage(null);
    }
  }, [items.length, appliedDiscount, clearDiscount]);

  const handleApplyDiscount = useCallback(async () => {
    if (!discountCodeInput.trim()) {
      setDiscountError("يرجى إدخال رمز الخصم");
      return;
    }
    if (subtotal <= 0) {
      setDiscountError("لا يمكن استخدام رمز الخصم بدون عناصر في السلة");
      return;
    }
    setDiscountError(null);
    setDiscountMessage(null);
    setIsApplyingDiscount(true);
    try {
      const response = await fetch("/api/discount-codes/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: discountCodeInput.trim(),
          subtotal,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "تعذر تطبيق رمز الخصم");
      }
      setDiscountInStore(data.discount);
      setDiscountMessage(data.message || "تم تطبيق رمز الخصم بنجاح");
      setDiscountError(null);
      setDiscountCodeInput(data.discount.code);
    } catch (applyError: any) {
      clearDiscount();
      setDiscountMessage(null);
      setDiscountError(applyError?.message || "تعذر تطبيق رمز الخصم");
    } finally {
      setIsApplyingDiscount(false);
    }
  }, [
    discountCodeInput,
    subtotal,
    clearDiscount,
    setDiscountInStore,
  ]);

  const handleRemoveDiscount = useCallback(() => {
    clearDiscount();
    setDiscountCodeInput("");
    setDiscountMessage(null);
    setDiscountError(null);
  }, [clearDiscount]);

  return (
    <div className="flex flex-col gap-6">
      {bannerMessage && (
        <div className="rounded-2xl border border-[rgba(10,110,92,0.12)] bg-[color:var(--color-surface-muted)] px-4 py-3 text-sm text-[color:var(--color-primary)]">
          {bannerMessage}
        </div>
      )}
      <div className="rounded-2xl border border-[rgba(10,110,92,0.12)] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-[color:var(--color-foreground)] sm:text-lg">
            كود الخصم
          </h2>
          {appliedDiscount ? (
            <div className="flex flex-col gap-2 rounded-2xl bg-[color:var(--color-surface-muted)] p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div>
                <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                  {appliedDiscount.code}
                </p>
                <p className="text-[11px] text-[color:var(--color-foreground-muted)] sm:text-xs">
                  خصم مفعّل على هذه السلة
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[color:var(--color-primary)]">
                  -
                  {computedDiscountAmount.toLocaleString("ar-TN", {
                    style: "currency",
                    currency: "TND",
                    maximumFractionDigits: 3,
                  })}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveDiscount}
                  className="text-xs font-semibold text-red-600 transition hover:text-red-700"
                >
                  إزالة الرمز
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                value={discountCodeInput}
                onChange={(e) =>
                  setDiscountCodeInput(e.target.value.toUpperCase())
                }
                placeholder="أدخل رمز الخصم"
                className="w-full rounded-2xl border border-[rgba(10,110,92,0.2)] px-3 py-2 text-sm text-[color:var(--color-foreground)] focus:border-[color:var(--color-primary)] focus:outline-none sm:flex-1 sm:rounded-full sm:px-4 sm:py-3"
              />
              <button
                type="button"
                onClick={handleApplyDiscount}
                disabled={isApplyingDiscount}
                className="rounded-2xl bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:rounded-full sm:px-5 sm:py-3"
              >
                {isApplyingDiscount ? "جاري التفعيل..." : "تطبيق"}
              </button>
            </div>
          )}
          {discountMessage && (
            <p className="text-xs font-semibold text-green-600">
              {discountMessage}
            </p>
          )}
          {discountError && (
            <p className="text-xs font-semibold text-red-600">{discountError}</p>
          )}
          {appliedDiscount &&
            subtotal > 0 &&
            subtotal < (appliedDiscount.minOrderTotal ?? 0) && (
              <p className="text-xs font-semibold text-red-600">
                الحد الأدنى لقيمة الطلب لهذا الرمز هو{" "}
                {appliedDiscount.minOrderTotal} د.ت
              </p>
            )}
        </div>
      </div>
      <CartSummary
        items={items}
        onCheckout={handleCheckout}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        deliveryFees={deliveryFees}
        discountAmount={computedDiscountAmount}
        discountCode={appliedDiscount?.code}
      />
      {items.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              clearCart();
              clearDiscount();
              setBannerMessage("تم مسح السلة.");
              setTimeout(() => setBannerMessage(null), 3000);
            }}
            className="rounded-full border border-[rgba(184,138,68,0.4)] px-4 py-2 text-sm font-semibold text-[color:var(--color-accent)] transition hover:border-[color:var(--color-accent)]"
          >
            مسح السلة
          </button>
        </div>
      )}
    </div>
  );
}





