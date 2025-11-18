"use client";

type CartItem = {
  id: string;
  title: string;
  quantity: number;
  price: number;
};

type CartSummaryProps = {
  items: CartItem[];
  onCheckout?: () => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemoveItem?: (id: string) => void;
  deliveryFees?: number;
  discountAmount?: number;
  discountCode?: string;
};

export function CartSummary({
  items,
  onCheckout,
  onUpdateQuantity,
  onRemoveItem,
  deliveryFees = 25,
  discountAmount = 0,
  discountCode,
}: CartSummaryProps) {
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingFees = items.length > 0 ? deliveryFees : 0;
  const normalizedDiscount =
    items.length > 0 ? Math.min(discountAmount, subtotal) : 0;
  const total = Math.max(0, subtotal - normalizedDiscount) + shippingFees;

  return (
    <section className="rounded-2xl border border-[rgba(10,110,92,0.12)] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <h2 className="mb-3 text-lg font-semibold text-[color:var(--color-foreground)] sm:mb-4 sm:text-xl">
        ملخص الطلب
      </h2>
      <div className="flex flex-col gap-4">
        {items.length === 0 && (
          <p className="text-sm text-[color:var(--color-foreground-muted)]">
            سلة المشتريات فارغة حالياً.
          </p>
        )}
        {items.map((item) => {
          const itemTotal = item.price * item.quantity;
          return (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-xl bg-[color:var(--color-surface-muted)] px-3 py-3 text-xs shadow-inner sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-4 sm:text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium text-[color:var(--color-foreground)] text-xs sm:text-sm">
                  {item.title}
                </span>
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-[color:var(--color-foreground-muted)] sm:gap-3 sm:text-xs">
                  <span>السعر للوحدة:{" "}
                    {item.price.toLocaleString("ar-TN", {
                      style: "currency",
                      currency: "TND",
                    maximumFractionDigits: 3,
                    })}
                  </span>
                  <span>الكمية: {item.quantity}</span>
                  <span>الإجمالي:{" "}
                    {itemTotal.toLocaleString("ar-TN", {
                      style: "currency",
                      currency: "TND",
                    maximumFractionDigits: 3,
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <button
                    type="button"
                    aria-label="زيادة الكمية"
                    onClick={() =>
                      onUpdateQuantity?.(item.id, item.quantity + 1)
                    }
                    className="flex h-10 w-10 min-w-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] text-base text-[color:var(--color-primary-foreground)] transition active:opacity-80 hover:opacity-90 sm:h-9 sm:w-9 sm:text-lg"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    aria-label="تقليل الكمية"
                    onClick={() =>
                      onUpdateQuantity?.(item.id, Math.max(1, item.quantity - 1))
                    }
                    className="flex h-10 w-10 min-w-[44px] items-center justify-center rounded-full border border-[rgba(10,110,92,0.2)] text-base text-[color:var(--color-primary)] transition active:border-[color:var(--color-primary)] hover:border-[color:var(--color-primary)] sm:h-9 sm:w-9 sm:text-lg"
                  >
                    −
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="إزالة الكتاب من السلة"
                  onClick={() => onRemoveItem?.(item.id)}
                  className="min-h-[44px] rounded-full border border-transparent px-3 py-2 text-[10px] font-semibold text-[color:var(--color-accent)] transition active:border-[rgba(184,138,68,0.4)] active:bg-white hover:border-[rgba(184,138,68,0.4)] hover:bg-white sm:px-4 sm:text-xs"
                >
                  إزالة
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-col gap-1.5 rounded-xl bg-[color:var(--color-surface-muted)] p-3 text-xs sm:mt-6 sm:gap-2 sm:rounded-2xl sm:p-4 sm:text-sm">
        <div className="flex items-center justify-between text-[color:var(--color-foreground-muted)]">
          <span>قيمة الكتب</span>
          <span>
            {subtotal.toLocaleString("ar-TN", {
              style: "currency",
              currency: "TND",
              maximumFractionDigits: 3,
            })}
          </span>
        </div>
        <div className="flex items-center justify-between text-[color:var(--color-foreground-muted)]">
          <span>رسوم التوصيل</span>
          <span>
            {shippingFees.toLocaleString("ar-TN", {
              style: "currency",
              currency: "TND",
              maximumFractionDigits: 3,
            })}
          </span>
        </div>
        {normalizedDiscount > 0 && (
          <div className="flex items-center justify-between text-[color:var(--color-accent)]">
            <span>
              خصم
              {discountCode ? ` (${discountCode})` : ""}
            </span>
            <span>
              -
              {normalizedDiscount.toLocaleString("ar-TN", {
                style: "currency",
                currency: "TND",
                maximumFractionDigits: 3,
              })}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-dashed border-[rgba(10,110,92,0.2)] pt-2 text-sm font-semibold text-[color:var(--color-foreground)] sm:pt-3 sm:text-base">
          <span>الإجمالي المستحق</span>
          <span>
            {total.toLocaleString("ar-TN", {
              style: "currency",
              currency: "TND",
              maximumFractionDigits: 3,
            })}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onCheckout}
        disabled={items.length === 0}
        className="mt-4 min-h-[48px] w-full rounded-full bg-[color:var(--color-primary)] py-3 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition active:opacity-80 hover:opacity-90 disabled:opacity-50 sm:mt-6 sm:text-base"
      >
        إتمام الطلب والدفع عند الاستلام
      </button>
    </section>
  );
}




