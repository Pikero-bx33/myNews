import express from "express";
import cors, { type CorsOptions } from "cors";
import { toNodeHandler } from "better-auth/node";
import { env } from "./config/env.js";
import { auth } from "./lib/auth.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import v1Router from "./routes/v1/index.js";

const app = express();

const corsOptions: CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    // Native requests have no browser Origin header and are not governed by CORS.
    callback(null, !origin || env.corsOrigins.includes(origin));
  },
};

app.use(cors(corsOptions));

if (env.nodeEnv !== "production") {
  app.use(requestLogger);
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Better Auth avant express.json()
app.all("/api/v1/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api/v1", v1Router);

export default app;
