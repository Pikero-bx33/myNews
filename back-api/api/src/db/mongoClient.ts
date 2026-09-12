import { MongoClient } from "mongodb";
import { env } from "../config/env.js";

if (!env.mongoUri) {
  throw new Error("MONGO_URI is missing");
}

export const mongoClient = new MongoClient(env.mongoUri);