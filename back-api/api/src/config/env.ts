import dotenv from "dotenv"; // dotenv charge les variables de .env dans process.env

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 3001,
  mongoUri: process.env.MONGO_URI || "",
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || "",
  betterAuthUrl: process.env.BETTER_AUTH_URL || "http://localhost:3001",
};