import { z } from "zod";

export const reviewInputSchema = z.object({
  rating: z.number().min(1).max(5, { message: "التقييم يجب أن يكون بين 1 و 5" }),
  comment: z.string().max(2000, { message: "التعليق يجب ألا يتجاوز 2000 حرف" }).optional(),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;










