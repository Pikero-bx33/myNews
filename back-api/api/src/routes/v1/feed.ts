import { fromNodeHeaders } from "better-auth/node";
import { Router } from "express";

import { auth } from "../../lib/auth.js";
import { UserPreferencesModel } from "../../models/userPreferences.js";
import { getTheNewsApiFeed, TheNewsApiError } from "../../providers/thenewsapi.js";

const feedRouter = Router();

feedRouter.get("/feed", async (req, res) => {
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

    const articles = await getTheNewsApiFeed(preferences);
    return res.json({ articles });
  } catch (error) {
    if (error instanceof TheNewsApiError) {
      const status = error.status === 429 ? 503 : 502;
      return res.status(status).json({ error: "News provider unavailable" });
    }

    console.error("Failed to get personalized feed", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default feedRouter;
