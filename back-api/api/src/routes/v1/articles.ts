import { fromNodeHeaders } from "better-auth/node";
import { Router, type Request } from "express";
import { Types } from "mongoose";
import { ZodError } from "zod";

import { auth } from "../../lib/auth.js";
import { ArticleModel } from "../../models/article.js";
import { UserArticleStateModel } from "../../models/userArticleState.js";
import {
  articleIdParamsSchema,
  userArticleStateUpdateSchema,
} from "../../schemas/userArticleState.js";
import {
  emptyArticleUserState,
  serializeArticleUserState,
} from "../../services/articleUserState.js";

const articlesRouter = Router();

const getAuthenticatedUserId = async (req: Request): Promise<string | null> => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  return session?.user.id ?? null;
};

const getArticleId = (params: unknown): Types.ObjectId => {
  const { articleId } = articleIdParamsSchema.parse(params);
  return new Types.ObjectId(articleId);
};

articlesRouter.get("/articles/:articleId/state", async (req, res) => {
  try {
    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const articleId = getArticleId(req.params);
    const articleExists = await ArticleModel.exists({ _id: articleId });

    if (!articleExists) {
      return res.status(404).json({ error: "Article not found" });
    }

    const state = await UserArticleStateModel.findOne({ userId, articleId }).lean();
    const userState = state
      ? serializeArticleUserState(state)
      : emptyArticleUserState();

    return res.json({ articleId: articleId.toString(), ...userState });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: "Invalid article ID" });
    }

    console.error("Failed to get article state", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

articlesRouter.put("/articles/:articleId/state", async (req, res) => {
  try {
    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const articleId = getArticleId(req.params);
    const input = userArticleStateUpdateSchema.parse(req.body);
    const articleExists = await ArticleModel.exists({ _id: articleId });

    if (!articleExists) {
      return res.status(404).json({ error: "Article not found" });
    }

    const now = new Date();
    const update: Record<string, boolean | Date | null> = {};

    if (input.isFavorite !== undefined) {
      update.isFavorite = input.isFavorite;
      update.savedAt = input.isFavorite ? now : null;
    }

    if (input.isRead !== undefined) {
      update.isRead = input.isRead;
      update.readAt = input.isRead ? now : null;
    }

    const state = await UserArticleStateModel.findOneAndUpdate(
      { userId, articleId },
      {
        $set: update,
        $setOnInsert: { userId, articleId },
      },
      {
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
        upsert: true,
      },
    );

    return res.json({
      articleId: articleId.toString(),
      ...serializeArticleUserState(state),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: "Invalid article state update" });
    }

    console.error("Failed to update article state", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default articlesRouter;
