import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const requiredString = z.string().trim().min(1);

const optionalPort = z.preprocess(
  (value) => (typeof value === "string" && !value.trim() ? undefined : value),
  z.coerce.number().int().min(1).max(65535).optional(),
);

const nodeEnvironment = z.preprocess(
  (value) => (typeof value === "string" && !value.trim() ? "development" : value),
  z.enum(["development", "production", "test"]).default("development"),
);

const environmentSchema = z.object({
  PORT: optionalPort,
  NODE_ENV: nodeEnvironment,
  MONGO_URI: requiredString,
  BETTER_AUTH_SECRET: requiredString,
  BETTER_AUTH_URL: requiredString.url(),
  THE_NEWS_API_KEY: requiredString,
  CORS_ORIGINS: z.string().optional().default(""),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional().default(""),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const invalidVariables = parsedEnvironment.error.issues
    .map((issue) => issue.path.join("."))
    .join(", ");

  throw new Error(`Invalid environment configuration: ${invalidVariables}`);
}

export const parseOrigins = (value: string) =>
  [...new Set(value.split(",").map((origin) => origin.trim()).filter(Boolean))];

const corsOrigins = parseOrigins(parsedEnvironment.data.CORS_ORIGINS);
const betterAuthTrustedOrigins = parseOrigins(
  parsedEnvironment.data.BETTER_AUTH_TRUSTED_ORIGINS,
);

if (corsOrigins.some((origin) => origin.includes("*"))) {
  throw new Error("Invalid environment configuration: CORS_ORIGINS");
}

if (
  parsedEnvironment.data.NODE_ENV === "production" &&
  betterAuthTrustedOrigins.some((origin) => origin.includes("*"))
) {
  throw new Error("Invalid environment configuration: BETTER_AUTH_TRUSTED_ORIGINS");
}

export const env = {
  port: parsedEnvironment.data.PORT ?? 3001,
  nodeEnv: parsedEnvironment.data.NODE_ENV,
  mongoUri: parsedEnvironment.data.MONGO_URI,
  betterAuthSecret: parsedEnvironment.data.BETTER_AUTH_SECRET,
  betterAuthUrl: parsedEnvironment.data.BETTER_AUTH_URL,
  theNewsApiKey: parsedEnvironment.data.THE_NEWS_API_KEY,
  corsOrigins,
  betterAuthTrustedOrigins,
};
