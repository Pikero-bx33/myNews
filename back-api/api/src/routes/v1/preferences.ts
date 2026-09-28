import { Router, type Request } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { ZodError } from "zod";

import { auth } from "../../lib/auth.js";
import { UserPreferencesModel } from "../../models/userPreferences.js";
import { userPreferencesSchema } from "../../schemas/userPreferences.js";

const preferencesRouter = Router();

const getAuthenticatedUserId = async (req: Request): Promise<string | null> => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  return session?.user.id ?? null;
};

preferencesRouter.get("/preferences", async (req, res) => {
  try {
    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const preferences = await UserPreferencesModel.findOne({ userId });

    return res.json({ preferences });
  } catch (error) {
    console.error("Failed to get user preferences", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

preferencesRouter.put("/preferences", async (req, res) => {
  try {
    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const input = userPreferencesSchema.parse(req.body);
    const preferences = await UserPreferencesModel.findOneAndUpdate(
      { userId },
      {
        $set: input,
        $setOnInsert: { userId },
      },
      {
        new: true,
        runValidators: true,
        upsert: true,
      },
    );

    return res.json(preferences);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Invalid preferences",
        details: error.issues,
      });
    }

    console.error("Failed to save user preferences", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default preferencesRouter;
