import { z } from "zod";

export const deliveryPartnerInputSchema = z.object({
  name: z.string().min(2).max(120),
  contactName: z.string().max(100).optional(),
  contactPhone: z.string().max(30).optional(),
  contactEmail: z.union([
    z.string().email().max(120),
    z.literal(""),
    z.undefined(),
  ]).optional(),
  coverageZones: z.array(z.string().max(80)).optional(),
  deliveryFees: z.number().min(0).default(0),
  isActive: z.boolean().optional().default(true),
});

export type DeliveryPartnerInput = z.infer<
  typeof deliveryPartnerInputSchema
>;




