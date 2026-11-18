import app from "./app.js";
import { connectDB } from "./db/connectDB.js";
import { mongoClient } from "./db/mongoClient.js";
import { env } from "./config/env.js";

const startServer = async () => {
  try {
    await connectDB();
    await mongoClient.connect();

    app.listen(env.port, "0.0.0.0", () => {
      console.log(`Server running on 0.0.0.0:${env.port}`);
    });
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
};

startServer();
