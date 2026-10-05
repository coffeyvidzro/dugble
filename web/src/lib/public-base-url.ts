import { env } from "@/config/env";

export const publicBaseUrl = env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, "");
