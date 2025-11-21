import {
  InferSchemaType,
  Schema,
  model,
  models,
  type Model,
} from "mongoose";
import crypto from "crypto";

const NewsletterSubscriberSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "البريد الإلكتروني غير صحيح"],
    },
    name: { type: String, trim: true, maxlength: 140 },
    subscribedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    unsubscribeToken: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but enforce uniqueness for non-null
    },
    preferences: {
      newBooks: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      newsletters: { type: Boolean, default: true },
    },
    // Marketing fields (Phase A)
    source: {
      type: String,
      enum: ["footer", "signup", "checkout"],
      default: "footer",
    },
    interests: [{ type: String, trim: true, maxlength: 50 }],
    locale: { type: String, default: "ar", maxlength: 10 },
    tags: [{ type: String, trim: true, maxlength: 50 }],
  },
  {
    timestamps: true,
  },
);

// Generate unsubscribe token before saving
NewsletterSubscriberSchema.pre("save", function (next) {
  if (!this.unsubscribeToken) {
    this.unsubscribeToken = crypto.randomBytes(32).toString("hex");
  }
  next();
});

NewsletterSubscriberSchema.index({ email: 1 });
NewsletterSubscriberSchema.index({ isActive: 1 });
NewsletterSubscriberSchema.index({ unsubscribeToken: 1 });
NewsletterSubscriberSchema.index({ source: 1 });
NewsletterSubscriberSchema.index({ subscribedAt: -1 });
NewsletterSubscriberSchema.index({ createdAt: -1 });

export type NewsletterSubscriberDocument = InferSchemaType<
  typeof NewsletterSubscriberSchema
>;

export const NewsletterSubscriberModel =
  (models.NewsletterSubscriber as Model<NewsletterSubscriberDocument>) ||
  model<NewsletterSubscriberDocument>(
    "NewsletterSubscriber",
    NewsletterSubscriberSchema,
  );















