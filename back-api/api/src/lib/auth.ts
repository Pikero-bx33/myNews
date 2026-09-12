import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { mongoClient } from "../db/mongoClient.js";
import { env } from "../config/env.js";

export const auth = betterAuth({
  database: mongodbAdapter(mongoClient.db(), {
    client: mongoClient,
  }),
  secret: env.betterAuthSecret,
  baseURL: env.betterAuthUrl,
  basePath: "/api/v1/auth",
  trustedOrigins: ["http://localhost:3001", "exp://192.168.x.x:8081"],
  user: { modelName: "authUsers" },
  session: { modelName: "authSessions" },
  account: { modelName: "authAccounts" },
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});