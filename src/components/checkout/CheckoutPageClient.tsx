"use client";

import { useRouter } from "next/navigation";
import {
  useState,
  useTransition,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { CheckoutForm } from "@/components/forms/CheckoutForm";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartStore } from "@/lib/stores/cartStore";
import { useDiscountStore } from "@/lib/stores/discountStore";
import { calculateDiscountAmount } from "@/lib/utils/discount";

type DeliveryPartner = {
  _id: string;
  name: string;
  deliveryFees: number;
};

export function CheckoutPageClient() {
  const router = useRouter();
  const [isSubmitting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const appliedDiscount = useDiscountStore((state) => state.appliedDiscount);
  const setDiscountInStore = useDiscountStore(
    (state) => state.setAppliedDiscount,
  );
  const clearDiscount = useDiscountStore((state) => state.clearDiscount);
  
  // Calculate current delivery fees - updates when selectedPartnerId or deliveryPartners change
  const currentDeliveryFees = useMemo(() => {
    if (deliveryPartners.length === 0) {
      return 25;
    }
    if (!selectedPartnerId) {
      return deliveryPartners[0]?.deliveryFees ?? 25;
    }
    const selectedPartner = deliveryPartners.find(
      (p) => String(p._id) === String(selectedPartnerId)
    );
    return selectedPartner?.deliveryFees ?? deliveryPartners[0]?.deliveryFees ?? 25;
  }, [selectedPartnerId, deliveryPartners]);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      ),
    [items],
  );

  const computedDiscountAmount = useMemo(
    () => calculateDiscountAmount(appliedDiscount, subtotal),
    [appliedDiscount, subtotal],
  );

  // Clear applied discount if cart is emptied
  useEffect(() => {
    if (items.length === 0 && appliedDiscount) {
      clearDiscount();
      setDiscountCodeInput("");
      setDiscountMessage(null);
    }
  }, [items.length, appliedDiscount, clearDiscount]);

  // Fetch active delivery partners
  useEffect(() => {
    fetch("/api/delivery/public")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Ensure _id is converted to string and deliveryFees is a number
          const partners = data.map((p: any) => {
            return {
              ...p,
              _id: String(p._id || ""),
              deliveryFees: Number(p.deliveryFees || 0),
            };
          });
          setDeliveryPartners(partners);
          // Auto-select first partner if available
          if (partners.length > 0) {
            setSelectedPartnerId(String(partners[0]._id));
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching delivery partners:", error);
      });
  }, []);

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
  }, [discountCodeInput, subtotal, clearDiscount, setDiscountInStore]);

  const handleRemoveDiscount = useCallback(() => {
    clearDiscount();
    setDiscountCodeInput("");
    setDiscountMessage(null);
    setDiscountError(null);
  }, [clearDiscount]);

  const handleSubmit = async (formData: FormData) => {
    if (items.length === 0) {
      setError("السلة فارغة. يرجى إضافة كتب قبل إتمام الطلب.");
      return;
    }

    setError(null);

    const selectedPartner = deliveryPartners.find((p) => p._id === selectedPartnerId);
    
    const subscribeNewsletter = formData.get("subscribeNewsletter") === "true" || formData.get("subscribeNewsletter") === true;
    
    const orderData = {
      customerName: formData.get("fullName") as string,
      phone: formData.get("phone") as string,
      email: (formData.get("email") as string) || undefined,
      city: formData.get("city") as string,
      address: formData.get("address") as string,
      notes: (formData.get("notes") as string) || undefined,
      items: items.map((item) => ({
        bookId: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      })),
      deliveryFees: selectedPartner
        ? selectedPartner.deliveryFees
        : deliveryPartners.length > 0
          ? deliveryPartners[0].deliveryFees
          : 25, // Fallback to 25 if no partners
      deliveryPartner: selectedPartnerId || undefined,
      discountCode: appliedDiscount?.code,
      discountAmount: computedDiscountAmount,
      subscribeNewsletter: subscribeNewsletter || undefined,
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error("Failed to parse response JSON:", jsonError);
          setError("حدث خطأ في استجابة الخادم. يرجى المحاولة مرة أخرى.");
          return;
        }

        if (!response.ok) {
          // عرض تفاصيل الخطأ بشكل أفضل
          let errorMessage = data.error || "تعذر إتمام الطلب. يرجى المحاولة مرة أخرى.";
          
          if (data.details && Array.isArray(data.details)) {
            const details = data.details
              .map((d: any) => {
                const field = d.field || "حقل غير معروف";
                return `• ${field}: ${d.message || "قيمة غير صحيحة"}`;
              })
              .join("\n");
            errorMessage = `بيانات غير صحيحة:\n\n${details}\n\nيرجى التحقق من الحقول المطلوبة.`;
          } else if (data.message) {
            errorMessage = data.message;
          }
          
          setError(errorMessage);
          return;
        }

        const orderCode = data.data?.orderCode;

        if (!orderCode) {
          setError("تم إنشاء الطلب لكن لم يتم الحصول على رقم الطلب.");
          return;
        }

        clearCart();
        clearDiscount();
        router.push(`/orders/confirmation?code=${encodeURIComponent(orderCode)}`);
      } catch (error) {
        console.error("Failed to submit order", error);
        setError("حدث خطأ أثناء إرسال الطلب. تحقق من الاتصال بالإنترنت.");
      }
    });
  };

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 sm:gap-8 sm:px-6 sm:py-16 lg:grid-cols-[1.6fr_1fr]">
      <div className="flex flex-col gap-4 sm:gap-6">
        <header className="flex flex-col gap-2 sm:gap-3">
          <h1 className="text-2xl font-bold text-[color:var(--color-foreground)] sm:text-3xl">
            تفاصيل التوصيل والدفع
          </h1>
          <p className="text-xs text-[color:var(--color-foreground-muted)] sm:text-sm">
            أدخل بياناتك لإتمام الطلب، وسيتم التواصل معك لتأكيد عملية التوصيل
            والدفع نقداً عند الاستلام.
          </p>
        </header>
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <CheckoutForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          deliveryPartners={deliveryPartners}
          selectedPartnerId={selectedPartnerId}
          onPartnerChange={setSelectedPartnerId}
        />
      </div>
      <div className="flex flex-col gap-4">
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
                    خصم مفعّل على الطلب الحالي
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
                  onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
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
              <p className="text-xs font-semibold text-green-600">{discountMessage}</p>
            )}
            {discountError && (
              <p className="text-xs font-semibold text-red-600">{discountError}</p>
            )}
            {appliedDiscount &&
              subtotal > 0 &&
              subtotal < (appliedDiscount.minOrderTotal ?? 0) && (
                <p className="text-xs font-semibold text-red-600">
                  الحد الأدنى لقيمة الطلب لاستخدام هذا الرمز هو{" "}
                  {appliedDiscount.minOrderTotal} د.ت
                </p>
              )}
          </div>
        </div>
        <CartSummary
          items={items}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          deliveryFees={currentDeliveryFees}
          discountAmount={computedDiscountAmount}
          discountCode={appliedDiscount?.code}
        />
        <div className="rounded-2xl border border-[rgba(184,138,68,0.2)] bg-white p-4 text-xs text-[color:var(--color-foreground-muted)] sm:rounded-3xl sm:p-5 sm:text-sm">
          <h2 className="mb-2 text-base font-semibold text-[color:var(--color-foreground)] sm:mb-3 sm:text-lg">
            معلومات مهمة
          </h2>
          <ul className="flex list-disc flex-col gap-1.5 pr-4 sm:gap-2 sm:pr-5">
            <li> الدفع يتم نقداً عند الاستلام.</li>
            <li>التوصيل عبر شركاء محليين مع متابعة من فريقنا.</li>
            <li>سيتم تأكيد الطلب عبر مكالمة هاتفية قصيرة.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

