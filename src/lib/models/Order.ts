import {
  InferSchemaType,
  Schema,
  model,
  models,
  type Model,
} from "mongoose";

const OrderItemSchema = new Schema(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book" },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const OrderStatusSchema = new Schema(
  {
    status: { type: String, required: true },
    note: { type: String, trim: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    orderCode: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, maxlength: 400 },
    deliveryPartner: { type: Schema.Types.ObjectId, ref: "DeliveryPartner" },
    status: {
      type: String,
      enum: ["قيد المعالجة", "تم الإرسال", "تم التسليم", "تم الإلغاء"],
      default: "قيد المعالجة",
    },
    statusHistory: {
      type: [OrderStatusSchema],
      default: function () {
        return [
          {
            status: "قيد المعالجة",
            updatedAt: new Date(),
          },
        ];
      },
    },
    items: { type: [OrderItemSchema], required: true, default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFees: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    discountCode: { type: String, trim: true, maxlength: 32 },
    discountAmount: { type: Number, default: 0, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery"],
      default: "cash_on_delivery",
    },
    confirmedAt: { type: Date },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

OrderSchema.index({ phone: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export type OrderDocument = InferSchemaType<typeof OrderSchema>;

export const OrderModel =
  (models.Order as Model<OrderDocument>) ||
  model<OrderDocument>("Order", OrderSchema);



















