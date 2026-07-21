import type { MetadataRoute } from "next";
import { env } from "@/config/env";

const baseUrl = env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, "");

const routes = [
  "",
  "/about",
  "/contact",
  "/email-api",
  "/industries/ecommerce",
  "/industries/fintech",
  "/industries/logistics",
  "/industries/marketplaces",
  "/industries/saas",
  "/legal/privacy",
  "/legal/terms",
  "/pricing",
  "/quickstart",
  "/security",
  "/sms-api",
  "/status",
  "/use-cases/customer-notifications",
  "/use-cases/delivery-updates",
  "/use-cases/marketing-campaigns",
  "/use-cases/otp",
  "/use-cases/payment-receipts",
  "/use-cases/transactional-email",
  "/webhooks",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
