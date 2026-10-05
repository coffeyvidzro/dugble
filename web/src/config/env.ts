import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

const backendUrl = isProduction
  ? z.url().refine((value) => value.startsWith("https://"), {
      message: "BACKEND_URL must use https:// in production.",
    })
  : z.url().default("http://localhost:8080");

const baseUrl = isProduction
  ? z.url()
  : z.url().default("http://localhost:3000");

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    BACKEND_URL: backendUrl,
  },
  client: {
    NEXT_PUBLIC_BASE_URL: baseUrl,
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  emptyStringAsUndefined: true,
});
