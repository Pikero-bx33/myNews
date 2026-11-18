import { z } from "zod";

const nonEmptyStringArray = z
  .array(z.string().trim().min(1))
  .transform((values) => [...new Set(values)]);

const caseInsensitiveNonEmptyStringArray = z
  .array(z.string().trim().min(1))
  .transform((values) => {
    const seenValues = new Set<string>();

    return values.filter((value) => {
      const normalizedValue = value.toLowerCase();

      if (seenValues.has(normalizedValue)) {
        return false;
      }

      seenValues.add(normalizedValue);
      return true;
    });
  });

export const userPreferencesSchema = z
  .object({
    topics: nonEmptyStringArray,
    keywords: caseInsensitiveNonEmptyStringArray,
    contentLanguages: z
      .array(z.enum(["fr", "en"]))
      .transform((values) => [...new Set(values)]),
    preferredSources: nonEmptyStringArray,
    blockedSources: nonEmptyStringArray,
  })
  .strict();

export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
