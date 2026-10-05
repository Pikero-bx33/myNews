import { model, Schema } from "mongoose";

export interface Article {
  provider: "thenewsapi";
  externalId: string;
  title: string;
  description: string | null;
  articleUrl: string;
  imageUrl: string | null;
  sourceName: string;
  sourceDomain: string;
  publishedAt: Date;
  language: string;
  topics: string[];
  fetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<Article>(
  {
    provider: { type: String, enum: ["thenewsapi"], required: true },
    externalId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    articleUrl: { type: String, required: true },
    imageUrl: { type: String, default: null },
    sourceName: { type: String, required: true },
    sourceDomain: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    language: { type: String, required: true },
    topics: { type: [String], default: [] },
    fetchedAt: { type: Date, required: true },
  },
  {
    collection: "articles",
    timestamps: true,
  },
);

articleSchema.index({ provider: 1, externalId: 1 }, { unique: true });

export const ArticleModel = model<Article>("Article", articleSchema);
