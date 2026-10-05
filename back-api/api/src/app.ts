import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import v1Router from "./routes/v1/index.js";
//import { notFound } from "./middlewares/notFound";
//import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors());

if (process.env.NODE_ENV !== "production") {
  app.use(requestLogger);
}

// Better Auth avant express.json()
app.all("/api/v1/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api/v1", v1Router); // préfixe global pour toutes les routes de l'API

/* app.use(notFound);
app.use(errorHandler); */

export default app;
