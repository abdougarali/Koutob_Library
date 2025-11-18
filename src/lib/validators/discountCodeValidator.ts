import { z } from "zod";

export const discountCodeInputSchema = z
  .object({
    code: z
      .string()
      .min(3, "الرمز يجب أن يكون 3 أحرف على الأقل")
      .max(32, "الرمز طويل جداً")
      .regex(/^[A-Za-z0-9-_]+$/, "يمكن استخدام الحروف والأرقام والخط العلوي فقط"),
    description: z.string().max(200, "الوصف طويل جداً").optional(),
    type: z.enum(["percentage", "fixed"]),
    value: z.coerce
      .number({
        invalid_type_error: "قيمة الخصم غير صالحة",
      })
      .positive("قيمة الخصم يجب أن تكون أكبر من صفر"),
    minOrderTotal: z
      .coerce.number({ invalid_type_error: "قيمة الحد الأدنى غير صالحة" })
      .min(0, "قيمة الحد الأدنى يجب أن تكون موجبة")
      .default(0),
    maxDiscountAmount: z
      .coerce.number({ invalid_type_error: "قيمة الخصم القصوى غير صالحة" })
      .min(0, "قيمة الخصم القصوى يجب أن تكون موجبة")
      .optional(),
    usageLimit: z
      .coerce.number({ invalid_type_error: "قيمة الحد الأقصى للاستخدام غير صالحة" })
      .int("يجب أن يكون عدداً صحيحاً")
      .min(1, "يجب أن يكون 1 على الأقل")
      .optional(),
    perUserLimit: z
      .coerce.number({ invalid_type_error: "قيمة الحد لكل مستخدم غير صالحة" })
      .int("يجب أن يكون عدداً صحيحاً")
      .min(1, "يجب أن يكون 1 على الأقل")
      .optional(),
    startDate: z.preprocess(
      (value) => (value ? new Date(value as string) : undefined),
      z.date().optional(),
    ),
    endDate: z.preprocess(
      (value) => (value ? new Date(value as string) : undefined),
      z.date().optional(),
    ),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "percentage" && data.value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "نسبة الخصم لا يمكن أن تتجاوز 100٪",
      });
    }

    if (data.endDate && data.startDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية",
      });
    }
  });

export type DiscountCodeInput = z.infer<typeof discountCodeInputSchema>;








