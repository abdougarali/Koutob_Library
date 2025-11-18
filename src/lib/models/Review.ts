import {
  InferSchemaType,
  Schema,
  model,
  models,
  type Model,
} from "mongoose";

const ReviewSchema = new Schema(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: { type: String, trim: true, maxlength: 2000 },
    verifiedPurchase: { type: Boolean, default: false }, // Set to true if user has purchased the book
    isApproved: { type: Boolean, default: false }, // Admin moderation
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

// Ensure one review per user per book
ReviewSchema.index({ book: 1, user: 1 }, { unique: true });
ReviewSchema.index({ book: 1, isApproved: 1, createdAt: -1 });
ReviewSchema.index({ user: 1 });

export type ReviewDocument = InferSchemaType<typeof ReviewSchema>;

export const ReviewModel =
  (models.Review as Model<ReviewDocument>) ||
  model<ReviewDocument>("Review", ReviewSchema);










