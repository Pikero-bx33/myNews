import { fromNodeHeaders } from "better-auth/node";
import { Router, type Request } from "express";

import { auth } from "../../lib/auth.js";
import { ArticleModel } from "../../models/article.js";
import { UserArticleStateModel } from "../../models/userArticleState.js";
import { serializeArticle } from "../../services/articlePersistence.js";
import { serializeArticleUserState } from "../../services/articleUserState.js";

const favoritesRouter = Router();

const getAuthenticatedUserId = async (req: Request): Promise<string | null> => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  return session?.user.id ?? null;
};

favoritesRouter.get("/favorites", async (req, res) => {
  try {
    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const states = await UserArticleStateModel.find({
      userId,
      isFavorite: true,
    })
      .sort({ savedAt: -1 })
      .lean();

    const articles = await ArticleModel.find({
      _id: { $in: states.map((state) => state.articleId) },
    }).lean();
    const articlesById = new Map(
      articles.map((article) => [article._id.toString(), article]),
    );

    return res.json({
      articles: states.flatMap((state) => {
        const article = articlesById.get(state.articleId.toString());

        if (!article) {
          return [];
        }

        return [
          {
            ...serializeArticle(article),
            userState: serializeArticleUserState(state),
          },
        ];
      }),
    });
  } catch (error) {
    console.error("Failed to get favorite articles", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default favoritesRouter;
