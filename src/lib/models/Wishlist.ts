import {
  InferSchemaType,
  Schema,
  model,
  models,
  type Model,
} from "mongoose";

const WishlistSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  },
  {
    timestamps: true,
  },
);

// Ensure one wishlist entry per user per book
WishlistSchema.index({ user: 1, book: 1 }, { unique: true });
WishlistSchema.index({ user: 1, createdAt: -1 });

export type WishlistDocument = InferSchemaType<typeof WishlistSchema>;

export const WishlistModel =
  (models.Wishlist as Model<WishlistDocument>) ||
  model<WishlistDocument>("Wishlist", WishlistSchema);





















