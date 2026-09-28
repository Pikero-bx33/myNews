import { z } from "zod";

const nonEmptyStringArray = z
  .array(z.string().trim().min(1))
  .transform((values) => [...new Set(values)]);

export const userPreferencesSchema = z
  .object({
    topics: nonEmptyStringArray,
    keywords: nonEmptyStringArray,
    contentLanguages: z
      .array(z.enum(["fr", "en"]))
      .transform((values) => [...new Set(values)]),
    preferredSources: nonEmptyStringArray,
    blockedSources: nonEmptyStringArray,
  })
  .strict();

export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
