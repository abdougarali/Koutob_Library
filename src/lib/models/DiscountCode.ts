import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose";

const DiscountUsageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    count: { type: Number, default: 0 },
  },
  { _id: false },
);

const DiscountCodeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 32,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
      default: "percentage",
    },
    value: { type: Number, required: true, min: 0 },
    minOrderTotal: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    usageLimit: { type: Number, min: 1 },
    usageCount: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, min: 1 },
    isActive: { type: Boolean, default: true },
    usageByCustomer: {
      type: [DiscountUsageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

DiscountCodeSchema.index({ code: 1 });
DiscountCodeSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

export type DiscountCodeDocument = InferSchemaType<typeof DiscountCodeSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const DiscountCodeModel =
  (models.DiscountCode as Model<DiscountCodeDocument>) ||
  model<DiscountCodeDocument>("DiscountCode", DiscountCodeSchema);









