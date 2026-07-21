import { env } from "@/config/env";

export const baseUrl = env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, "");
