import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(["development", "production"]).default("development"),
        BACKEND_URL: z.url().default("http://localhost:8080"),
    },
    client: {
        NEXT_PUBLIC_BASE_URL: z
            .string()
            .min(1)
            .default("http://localhost:3000"),
    },
    experimental__runtimeEnv: {
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    },
});
