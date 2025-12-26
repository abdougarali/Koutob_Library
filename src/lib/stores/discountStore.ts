"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AppliedDiscount = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  maxDiscountAmount: number | null;
  minOrderTotal?: number | null;
};

type DiscountState = {
  appliedDiscount: AppliedDiscount | null;
  setAppliedDiscount: (discount: AppliedDiscount) => void;
  clearDiscount: () => void;
};

const STORAGE_KEY = "koutob-discount";

export const useDiscountStore = create<DiscountState>()(
  persist(
    (set) => ({
      appliedDiscount: null,
      setAppliedDiscount: (discount) => set({ appliedDiscount: discount }),
      clearDiscount: () => set({ appliedDiscount: null }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);


















