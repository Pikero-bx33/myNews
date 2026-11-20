import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { expo } from "@better-auth/expo";
import { mongoClient } from "../db/mongoClient.js";
import { env } from "../config/env.js";

const trustedOrigins = [
  "frontapp://",
  ...(env.nodeEnv === "production" ? [] : ["exp://", "exp://**"]),
  ...env.betterAuthTrustedOrigins,
];

export const auth = betterAuth({
  database: mongodbAdapter(mongoClient.db(), {
    client: mongoClient,
  }),
  secret: env.betterAuthSecret,
  baseURL: env.betterAuthUrl,
  basePath: "/api/v1/auth",
  trustedOrigins,
  user: { modelName: "authUsers" },
  session: { modelName: "authSessions" },
  account: { modelName: "authAccounts" },
  plugins: [expo()],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
});
