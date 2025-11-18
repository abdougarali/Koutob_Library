import {
  InferSchemaType,
  Schema,
  model,
  models,
  type Model,
} from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    // Email verification fields
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationTokenExpires: { type: Date },
    // Password reset fields
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    // Login attempt tracking
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },
  {
    timestamps: true,
    strict: true, // Enforce schema
  },
);

// Email index is already created by unique: true, so we don't need to add it again
UserSchema.index({ role: 1 });

export type UserDocument = InferSchemaType<typeof UserSchema>;

export const UserModel =
  (models.User as Model<UserDocument>) ||
  model<UserDocument>("User", UserSchema);


