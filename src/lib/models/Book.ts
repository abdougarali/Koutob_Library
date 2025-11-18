import {
  InferSchemaType,
  Schema,
  model,
  models,
  type Model,
} from "mongoose";

const BookSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, trim: true },
    author: { type: String, required: true, trim: true, maxlength: 140 },
    publisher: { type: String, trim: true, maxlength: 120 },
    publishedYear: { type: Number },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 4000 },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    imageUrl: { type: String, required: true },
    // Optional: support multiple images without breaking existing imageUrl usage
    images: [
      {
        publicId: { type: String, trim: true },
        url: { type: String, trim: true },
        width: { type: Number },
        height: { type: Number },
        format: { type: String, trim: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    coverColor: { type: String },
    language: { type: String, default: "arabic" },
    format: {
      type: String,
      enum: ["hardcover", "paperback"],
      default: "paperback",
    },
    keywords: [{ type: String, trim: true }],
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
  },
  {
    timestamps: true,
  },
);

BookSchema.index({ category: 1, status: 1 });
BookSchema.index({ title: "text", author: "text", keywords: "text" });

export type BookDocument = InferSchemaType<typeof BookSchema>;

export const BookModel =
  (models.Book as Model<BookDocument>) || model<BookDocument>("Book", BookSchema);

















