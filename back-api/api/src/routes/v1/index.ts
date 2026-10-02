import { Router } from "express";
import feedRouter from "./feed.js";
import preferencesRouter from "./preferences.js";

const router = Router();

router.use(preferencesRouter);
router.use(feedRouter);

export default router;
