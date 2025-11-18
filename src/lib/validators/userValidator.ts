import { z } from "zod";

export const userInputSchema = z.object({
  name: z.string().min(3).max(140),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "customer"]).default("customer"),
  phone: z.string().max(20).optional(),
  address: z.string().max(240).optional(),
  city: z.string().max(90).optional(),
  isActive: z.boolean().optional().default(true),
});

export const userUpdateSchema = userInputSchema.partial().extend({
  password: z.string().min(6).optional(),
});

export type UserInput = z.infer<typeof userInputSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;


