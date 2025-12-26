import { InferSchemaType, Schema, model, models, type Model } from "mongoose";

const SavedAddressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, required: true, trim: true, maxlength: 50 }, // e.g., "المنزل", "العمل"
    name: { type: String, required: true, trim: true, maxlength: 140 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    address: { type: String, required: true, trim: true, maxlength: 240 },
    city: { type: String, required: true, trim: true, maxlength: 90 },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

SavedAddressSchema.index({ user: 1, isDefault: 1 });

export type SavedAddressDocument = InferSchemaType<typeof SavedAddressSchema>;

export const SavedAddressModel =
  (models.SavedAddress as Model<SavedAddressDocument>) ||
  model<SavedAddressDocument>("SavedAddress", SavedAddressSchema);



















