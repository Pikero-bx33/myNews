import { fromNodeHeaders } from "better-auth/node";
import { Router } from "express";
import { z } from "zod";

import { auth } from "../../lib/auth.js";
import { UserPreferencesModel } from "../../models/userPreferences.js";
import { getTheNewsApiFeed, TheNewsApiError } from "../../providers/thenewsapi.js";
import { persistFeedArticles } from "../../services/articlePersistence.js";
import { addUserStatesToFeed } from "../../services/articleUserState.js";

const feedRouter = Router();

const feedQuerySchema = z
  .object({
    page: z.string().regex(/^[1-9]\d*$/).transform(Number).optional(),
  })
  .strict();

feedRouter.get("/feed", async (req, res) => {
  const parsedQuery = feedQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    return res.status(400).json({ error: "Invalid page parameter" });
  }

  const page = parsedQuery.data.page ?? 1;

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const preferences = await UserPreferencesModel.findOne({
      userId: session.user.id,
    }).lean();

    if (!preferences) {
      return res.status(409).json({ error: "Preferences required" });
    }

    const providerFeed = await getTheNewsApiFeed(preferences, page);
    const persistedArticles = await persistFeedArticles(providerFeed.articles);
    const articles = await addUserStatesToFeed(session.user.id, persistedArticles);
    const resultsSeen =
      (providerFeed.meta.page - 1) * providerFeed.meta.limit +
      providerFeed.meta.returned;
    const hasMore =
      providerFeed.meta.returned === providerFeed.meta.limit &&
      resultsSeen < providerFeed.meta.found;

    return res.json({
      articles,
      pagination: {
        page: providerFeed.meta.page,
        hasMore,
      },
    });
  } catch (error) {
    if (error instanceof TheNewsApiError) {
      const status = error.status === 402 || error.status === 429 ? 503 : 502;
      return res.status(status).json({ error: "News provider unavailable" });
    }

    console.error("Failed to get personalized feed", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default feedRouter;
