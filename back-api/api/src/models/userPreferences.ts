import { model, Schema } from "mongoose";

export type ContentLanguage = "fr" | "en";

export interface UserPreferences {
  userId: string;
  topics: string[];
  keywords: string[];
  contentLanguages: ContentLanguage[];
  preferredSources: string[];
  blockedSources: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userPreferencesSchema = new Schema<UserPreferences>(
  {
    userId: { type: String, required: true, unique: true },
    topics: { type: [String], default: [] },
    keywords: { type: [String], default: [] },
    contentLanguages: {
      type: [String],
      enum: ["fr", "en"],
      default: [],
    },
    preferredSources: { type: [String], default: [] },
    blockedSources: { type: [String], default: [] },
  },
  {
    collection: "userPreferences",
    timestamps: true,
  },
);

export const UserPreferencesModel = model<UserPreferences>(
  "UserPreferences",
  userPreferencesSchema,
);
