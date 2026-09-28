import { Router } from "express";
import preferencesRouter from "./preferences.js";

const router = Router();

router.use(preferencesRouter);

export default router;
