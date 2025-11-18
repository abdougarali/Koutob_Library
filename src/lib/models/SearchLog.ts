import {
  InferSchemaType,
  Schema,
  model,
  models,
  type Model,
} from "mongoose";

const SearchLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow anonymous searches
    },
    query: { type: String, required: true, trim: true, maxlength: 200 },
    clickedBook: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: false,
    },
    sessionId: { type: String, trim: true }, // For anonymous users
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
SearchLogSchema.index({ user: 1, createdAt: -1 }); // Recent searches per user
SearchLogSchema.index({ query: 1, createdAt: -1 }); // Popular searches
SearchLogSchema.index({ createdAt: -1 }); // Time-based queries

export type SearchLogDocument = InferSchemaType<typeof SearchLogSchema>;

export const SearchLogModel =
  (models.SearchLog as Model<SearchLogDocument>) ||
  model<SearchLogDocument>("SearchLog", SearchLogSchema);








