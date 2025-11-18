import {
  InferSchemaType,
  Schema,
  model,
  models,
  type Model,
} from "mongoose";

const DeliveryPartnerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    contactName: { type: String, trim: true, maxlength: 100 },
    contactPhone: { type: String, trim: true },
    contactEmail: { type: String, trim: true, maxlength: 120 },
    coverageZones: [{ type: String, trim: true }],
    deliveryFees: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

DeliveryPartnerSchema.index({ isActive: 1 });

export type DeliveryPartnerDocument = InferSchemaType<
  typeof DeliveryPartnerSchema
>;

export const DeliveryPartnerModel =
  (models.DeliveryPartner as Model<DeliveryPartnerDocument>) ||
  model<DeliveryPartnerDocument>("DeliveryPartner", DeliveryPartnerSchema);




