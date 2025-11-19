import {
  InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    isRead: { type: Boolean, default: false },
    repliedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

ContactMessageSchema.index({ email: 1 });
ContactMessageSchema.index({ isRead: 1, createdAt: -1 });
ContactMessageSchema.index({ createdAt: -1 });

export type ContactMessageDocument = InferSchemaType<typeof ContactMessageSchema> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

export const ContactMessageModel =
  (models.ContactMessage as ReturnType<typeof model<ContactMessageDocument>>) ||
  model<ContactMessageDocument>("ContactMessage", ContactMessageSchema);

