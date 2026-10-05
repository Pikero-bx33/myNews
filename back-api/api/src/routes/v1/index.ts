import { Router } from "express";
import articlesRouter from "./articles.js";
import feedRouter from "./feed.js";
import favoritesRouter from "./favorites.js";
import preferencesRouter from "./preferences.js";

const router = Router();

router.use(preferencesRouter);
router.use(feedRouter);
router.use(articlesRouter);
router.use(favoritesRouter);

export default router;
