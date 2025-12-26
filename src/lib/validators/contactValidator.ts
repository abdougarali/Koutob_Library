import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(140, "الاسم طويل جداً"),
  email: z.string().email("البريد الإلكتروني غير صالح").max(200, "البريد الإلكتروني طويل جداً"),
  subject: z.string().min(3, "الموضوع يجب أن يكون 3 أحرف على الأقل").max(200, "الموضوع طويل جداً"),
  message: z.string().min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل").max(2000, "الرسالة طويلة جداً"),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;








