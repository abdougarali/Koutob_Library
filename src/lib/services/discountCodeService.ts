import { dbConnect } from "@/lib/dbConnect";
import {
  DiscountCodeModel,
  type DiscountCodeDocument,
} from "@/lib/models/DiscountCode";
import type { DiscountCodeInput } from "@/lib/validators/discountCodeValidator";

export type DiscountCodeDTO = ReturnType<typeof mapDiscountCode>;

function mapDiscountCode(code: DiscountCodeDocument) {
  return {
    _id: code._id?.toString() ?? "",
    code: code.code,
    description: code.description ?? "",
    type: code.type,
    value: code.value,
    minOrderTotal: code.minOrderTotal ?? 0,
    maxDiscountAmount: code.maxDiscountAmount ?? null,
    startDate: code.startDate ? code.startDate.toISOString() : null,
    endDate: code.endDate ? code.endDate.toISOString() : null,
    usageLimit: code.usageLimit ?? null,
    usageCount: code.usageCount ?? 0,
    perUserLimit: code.perUserLimit ?? null,
    isActive: code.isActive ?? true,
    createdAt: code.createdAt?.toISOString() ?? "",
    updatedAt: code.updatedAt?.toISOString() ?? "",
  };
}

export async function getAllDiscountCodes() {
  await dbConnect();
  const codes = await DiscountCodeModel.find().sort({ createdAt: -1 }).lean();
  return codes.map((code) => mapDiscountCode(code as DiscountCodeDocument));
}

export async function createDiscountCode(payload: DiscountCodeInput) {
  await dbConnect();
  const code = await DiscountCodeModel.create({
    ...payload,
    code: payload.code.toUpperCase(),
  });
  return mapDiscountCode(code);
}

export async function updateDiscountCode(
  id: string,
  payload: Partial<DiscountCodeInput>,
) {
  await dbConnect();
  const update: Partial<DiscountCodeInput> & { code?: string } = { ...payload };
  if (update.code) {
    update.code = update.code.toUpperCase();
  }
  const updated = await DiscountCodeModel.findByIdAndUpdate(id, update, {
    new: true,
  });
  if (!updated) {
    throw new Error("رمز الخصم غير موجود");
  }
  return mapDiscountCode(updated);
}

export async function deleteDiscountCode(id: string) {
  await dbConnect();
  await DiscountCodeModel.findByIdAndDelete(id);
}

export type DiscountPreviewResult = {
  discount: DiscountCodeDTO;
  discountAmount: number;
};

function calculateDiscountAmount(
  discount: DiscountCodeDocument,
  subtotal: number,
) {
  if (subtotal <= 0) {
    return 0;
  }

  const minTotal = discount.minOrderTotal ?? 0;
  if (subtotal < minTotal) {
    return 0;
  }

  let amount =
    discount.type === "percentage"
      ? (subtotal * discount.value) / 100
      : discount.value;

  if (
    discount.type === "percentage" &&
    typeof discount.maxDiscountAmount === "number"
  ) {
    amount = Math.min(amount, discount.maxDiscountAmount);
  }

  if (amount > subtotal) {
    amount = subtotal;
  }

  return Math.max(0, amount);
}

export async function previewDiscount(
  code: string,
  subtotal: number,
): Promise<DiscountPreviewResult> {
  await dbConnect();

  const trimmedCode = code.trim().toUpperCase();
  if (!trimmedCode) {
    throw new Error("يرجى إدخال رمز خصم صالح");
  }

  const discountDoc = await DiscountCodeModel.findOne({
    code: trimmedCode,
  }).lean();

  if (!discountDoc) {
    throw new Error("رمز الخصم غير موجود");
  }

  if (!discountDoc.isActive) {
    throw new Error("تم إيقاف رمز الخصم");
  }

  const now = new Date();
  if (discountDoc.startDate && discountDoc.startDate > now) {
    throw new Error("رمز الخصم غير متاح بعد");
  }

  if (discountDoc.endDate && discountDoc.endDate < now) {
    throw new Error("انتهت صلاحية رمز الخصم");
  }

  if (
    typeof discountDoc.usageLimit === "number" &&
    typeof discountDoc.usageCount === "number" &&
    discountDoc.usageCount >= discountDoc.usageLimit
  ) {
    throw new Error("تم استخدام رمز الخصم الحد الأقصى من المرات");
  }

  const amount = calculateDiscountAmount(
    discountDoc as DiscountCodeDocument,
    subtotal,
  );

  if (amount <= 0) {
    const minTotal = discountDoc.minOrderTotal ?? 0;
    if (minTotal > 0 && subtotal < minTotal) {
      throw new Error(
        `الحد الأدنى لقيمة الطلب لاستخدام الرمز هو ${minTotal} د.ت`,
      );
    }
    throw new Error("تعذر تطبيق رمز الخصم على القيمة الحالية");
  }

  return {
    discount: mapDiscountCode(discountDoc as DiscountCodeDocument),
    discountAmount: amount,
  };
}



