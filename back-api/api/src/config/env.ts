import dotenv from "dotenv"; // dotenv charge les variables de .env dans process.env

dotenv.config();

const requiredEnvironmentVariable = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  port: Number(process.env.PORT) || 3001,
  mongoUri: process.env.MONGO_URI || "",
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || "",
  betterAuthUrl: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  theNewsApiKey: requiredEnvironmentVariable("THE_NEWS_API_KEY"),
};
