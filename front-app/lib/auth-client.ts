import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("EXPO_PUBLIC_API_URL is required to configure Better Auth.");
}

export const authClient = createAuthClient({
  baseURL: `${apiUrl.replace(/\/$/, "")}/api/v1/auth`,
  plugins: [
    expoClient({
      scheme: "frontapp",
      storagePrefix: "frontapp",
      storage: SecureStore,
    }),
  ],
});
