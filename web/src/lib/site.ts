import { env } from "@/config/env";

const configuredBaseUrl = env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, "");
const parsedBaseUrl = new URL(configuredBaseUrl);

if (
  env.NODE_ENV === "production" &&
  ["localhost", "127.0.0.1", "0.0.0.0"].includes(parsedBaseUrl.hostname)
) {
  throw new Error(
    "NEXT_PUBLIC_BASE_URL must use the public production origin when NODE_ENV=production.",
  );
}

export const baseUrl = parsedBaseUrl.toString().replace(/\/+$/, "");
