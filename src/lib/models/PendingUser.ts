import {
  InferSchemaType,
  Schema,
  model,
  models,
  type Model,
} from "mongoose";

const PendingUserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true }, // Hashed password
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    // Verification token
    emailVerificationToken: { type: String, required: true },
    emailVerificationTokenExpires: { type: Date, required: true },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Index for faster token lookup
PendingUserSchema.index({ emailVerificationToken: 1 });
PendingUserSchema.index({ emailVerificationTokenExpires: 1 }, { expireAfterSeconds: 0 });

export type PendingUserDocument = InferSchemaType<typeof PendingUserSchema>;

export const PendingUserModel =
  (models.PendingUser as Model<PendingUserDocument>) ||
  model<PendingUserDocument>("PendingUser", PendingUserSchema);












