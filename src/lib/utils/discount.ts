import type { AppliedDiscount } from "@/lib/stores/discountStore";

export function calculateDiscountAmount(
  appliedDiscount: AppliedDiscount | null,
  subtotal: number,
): number {
  if (!appliedDiscount) {
    return 0;
  }

  if (subtotal <= 0) {
    return 0;
  }

  const minOrderTotal = appliedDiscount.minOrderTotal ?? 0;
  if (subtotal < minOrderTotal) {
    return 0;
  }

  let amount =
    appliedDiscount.type === "percentage"
      ? (subtotal * appliedDiscount.value) / 100
      : appliedDiscount.value;

  if (
    appliedDiscount.type === "percentage" &&
    typeof appliedDiscount.maxDiscountAmount === "number" &&
    appliedDiscount.maxDiscountAmount > 0
  ) {
    amount = Math.min(amount, appliedDiscount.maxDiscountAmount);
  }

  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }

  return Math.min(amount, subtotal);
}







