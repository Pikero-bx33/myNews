import mongoose from "mongoose";
import { env } from "../config/env.js";

export const connectDB = async (): Promise<void> => {
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
};