import { z } from "zod";

export const articleIdParamsSchema = z.object({
  articleId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid article ID"),
});

export const userArticleStateUpdateSchema = z
  .object({
    isFavorite: z.boolean().optional(),
    isRead: z.boolean().optional(),
  })
  .strict()
  .refine(
    (input) => input.isFavorite !== undefined || input.isRead !== undefined,
    { message: "At least one state field is required" },
  );

export type UserArticleStateUpdateInput = z.infer<
  typeof userArticleStateUpdateSchema
>;
