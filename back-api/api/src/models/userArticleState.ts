import { model, Schema, type Types } from "mongoose";

export interface UserArticleState {
  userId: string;
  articleId: Types.ObjectId;
  isFavorite: boolean;
  isRead: boolean;
  savedAt: Date | null;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userArticleStateSchema = new Schema<UserArticleState>(
  {
    userId: { type: String, required: true },
    articleId: { type: Schema.Types.ObjectId, ref: "Article", required: true },
    isFavorite: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    savedAt: { type: Date, default: null },
    readAt: { type: Date, default: null },
  },
  {
    collection: "userArticleStates",
    timestamps: true,
  },
);

userArticleStateSchema.index({ userId: 1, articleId: 1 }, { unique: true });

export const UserArticleStateModel = model<UserArticleState>(
  "UserArticleState",
  userArticleStateSchema,
);
