import { z } from "zod";

export const orderItemSchema = z.object({
  bookId: z.string().min(1),
  title: z.string().min(2),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
});

export const orderInputSchema = z.object({
  customerName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(140),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{6,20}$/, "رقم الهاتف غير صالح")
    .trim(),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  city: z.string().min(2, "اسم المدينة يجب أن يكون حرفين على الأقل").max(90),
  address: z.string().min(8, "العنوان يجب أن يكون 8 أحرف على الأقل").max(240),
  notes: z.string().max(280).optional().or(z.literal("")),
  items: z.array(orderItemSchema).min(1, "يجب إضافة كتاب واحد على الأقل"),
  deliveryFees: z.number().min(0).optional().default(0),
  deliveryPartner: z.string().optional(),
  discountCode: z.string().trim().max(32).optional(),
  discountAmount: z.number().min(0).optional().default(0),
});

export type OrderInput = z.infer<typeof orderInputSchema>;




