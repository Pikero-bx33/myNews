import { z } from "zod";

const theNewsApiArticleSchema = z.object({
  uuid: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  image_url: z.string().nullable(),
  language: z.string(),
  published_at: z.string(),
  source: z.string(),
  categories: z.array(z.string()),
});

export const theNewsApiResponseSchema = z.object({
  meta: z.object({
    found: z.number(),
    returned: z.number(),
    limit: z.number(),
    page: z.number(),
  }),
  data: z.array(theNewsApiArticleSchema),
});

export const theNewsApiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
