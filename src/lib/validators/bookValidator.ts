import { z } from "zod";

export const bookInputSchema = z.object({
  title: z.string().min(3).max(180),
  slug: z.string().min(3).max(200),
  author: z.string().min(3).max(140),
  publisher: z.string().max(120).optional(),
  publishedYear: z
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  category: z.string().min(2).max(80),
  subCategory: z.string().max(80).optional(),
  description: z.string().max(4000).optional(),
  price: z.number().min(0),
  salePrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  imageUrl: z.string().min(1).refine((val) => {
    // قبول URLs كاملة أو مسارات محلية
    try {
      if (val.startsWith("http://") || val.startsWith("https://")) {
        new URL(val);
        return true;
      }
      if (val.startsWith("/")) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, { message: "يجب أن يكون رابط صحيح (http:// أو https://) أو مسار محلي (يبدأ بـ /)" }),
  // Optional: support multiple images while keeping existing imageUrl
  images: z
    .array(
      z.object({
        publicId: z.string().optional(),
        url: z.string().url().optional(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
        format: z.string().optional(),
        isPrimary: z.boolean().optional(),
      }),
    )
    .optional(),
  coverColor: z.string().optional(),
  language: z.string().default("arabic"),
  format: z.enum(["hardcover", "paperback"]).default("paperback"),
  keywords: z.array(z.string().max(60)).optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).default("published"),
});

export type BookInput = z.infer<typeof bookInputSchema>;

