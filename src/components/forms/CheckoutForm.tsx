"use client";

import { FormEvent } from "react";
import { CustomSelect } from "@/components/shared/CustomSelect";

type DeliveryPartner = {
  _id: string;
  name: string;
  deliveryFees: number;
};

type CheckoutFormProps = {
  onSubmit?: (formData: FormData) => void;
  isSubmitting?: boolean;
  deliveryPartners?: DeliveryPartner[];
  selectedPartnerId?: string;
  onPartnerChange?: (partnerId: string) => void;
};

export function CheckoutForm({
  onSubmit,
  isSubmitting = false,
  deliveryPartners = [],
  selectedPartnerId = "",
  onPartnerChange,
}: CheckoutFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    // Add deliveryPartner to form data if CustomSelect is used
    if (selectedPartnerId && !form.querySelector('select[name="deliveryPartner"]')) {
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = 'deliveryPartner';
      hiddenInput.value = selectedPartnerId;
      form.appendChild(hiddenInput);
    }
    onSubmit?.(new FormData(form));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-2xl border border-[rgba(10,110,92,0.12)] bg-white p-4 shadow-sm sm:gap-4 sm:rounded-3xl sm:p-6"
    >
      <h2 className="text-lg font-semibold text-[color:var(--color-foreground)] sm:text-xl">
        بيانات التوصيل والدفع
      </h2>
      <div className="grid gap-1">
        <label className="text-sm text-[color:var(--color-foreground-muted)]">
          الاسم الكامل
        </label>
        <input
          name="fullName"
          required
          className="min-h-[48px] rounded-xl border border-[rgba(10,110,92,0.2)] bg-[color:var(--color-surface-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] sm:rounded-2xl sm:px-4 sm:py-3"
          placeholder="اكتب اسمك الرباعي"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-[color:var(--color-foreground-muted)]">
          رقم الهاتف
        </label>
        <input
          name="phone"
          type="tel"
          inputMode="numeric"
          maxLength={8}
          required
          onKeyPress={(e) => {
            if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab") {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const numbersOnly = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
            e.target.value = numbersOnly;
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = (e.clipboardData || (window as any).clipboardData).getData("text");
            const numbersOnly = pastedText.replace(/[^0-9]/g, "").slice(0, 8);
            e.currentTarget.value = numbersOnly;
          }}
          className="min-h-[48px] rounded-xl border border-[rgba(10,110,92,0.2)] bg-[color:var(--color-surface-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] sm:rounded-2xl sm:px-4 sm:py-3"
          placeholder="مثال: 12345678"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-[color:var(--color-foreground-muted)]">
          البريد الإلكتروني (اختياري)
        </label>
        <input
          name="email"
          type="email"
          className="min-h-[48px] rounded-xl border border-[rgba(10,110,92,0.2)] bg-[color:var(--color-surface-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] sm:rounded-2xl sm:px-4 sm:py-3"
          placeholder="example@email.com"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-[color:var(--color-foreground-muted)]">
          المدينة
        </label>
        <input
          name="city"
          required
          className="min-h-[48px] rounded-xl border border-[rgba(10,110,92,0.2)] bg-[color:var(--color-surface-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] sm:rounded-2xl sm:px-4 sm:py-3"
          placeholder="اسم المدينة"
        />
      </div>
      {deliveryPartners.length > 0 && (
        <CustomSelect
          label="شركة التوصيل"
          value={selectedPartnerId}
          onChange={(value) => onPartnerChange?.(value)}
          options={deliveryPartners.map((partner) => ({
            value: partner._id,
            label: `${partner.name} - ${partner.deliveryFees} د.ت`,
          }))}
          placeholder="اختر شركة التوصيل"
          className="[&>button]:min-h-[48px] [&>button]:rounded-xl [&>button]:border-[rgba(10,110,92,0.2)] [&>button]:bg-[color:var(--color-surface-muted)] sm:[&>button]:rounded-2xl"
        />
      )}
      <div className="grid gap-1">
        <label className="text-sm text-[color:var(--color-foreground-muted)]">
          العنوان التفصيلي
        </label>
        <textarea
          name="address"
          required
          rows={3}
          className="min-h-[80px] rounded-xl border border-[rgba(10,110,92,0.2)] bg-[color:var(--color-surface-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] sm:rounded-2xl sm:px-4 sm:py-3"
          placeholder="الحي، الشارع، أقرب معلم..."
        />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-[color:var(--color-foreground-muted)]">
          ملاحظات إضافية لفريق التوصيل
        </label>
        <textarea
          name="notes"
          rows={2}
          className="min-h-[60px] rounded-xl border border-[rgba(10,110,92,0.2)] bg-[color:var(--color-surface-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] sm:rounded-2xl sm:px-4 sm:py-3"
          placeholder="أي تفاصيل إضافية تساعد فريق التوصيل"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 min-h-[52px] w-full rounded-full bg-[color:var(--color-primary)] py-3 text-sm font-semibold text-[color:var(--color-primary-foreground)] transition active:opacity-80 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed sm:text-base"
      >
        {isSubmitting ? "جاري إرسال الطلب..." : "تأكيد الطلب والدفع عند الاستلام"}
      </button>
    </form>
  );
}




