import { Cta } from "@/components/marketing/cta";
import { DashboardPreview } from "@/components/marketing/hero/dashboard-preview";
import { DeveloperExperience } from "@/components/marketing/hero/developer-experience";
import { Hero } from "@/components/marketing/hero/hero";
import { MessagePipeline } from "@/components/marketing/hero/message-pipeline";
import { Metrics } from "@/components/marketing/hero/metrics";
import { ProductGrid } from "@/components/marketing/hero/product-grid";
import { constructMetadata } from "@/utils/metadata";
import { getHomePageSchemaGraph, serializeSchema } from "@/utils/metagraph";

export const metadata = constructMetadata({
  title: "Reliable A2P Messaging & Developer Infrastructure",
  description:
    "Send OTPs, receipts, alerts, and customer notifications with complete delivery transparency, signed webhooks, and developer-first logs.",
  url: "/",
});

export default function Home() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <script
        id="homepage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeSchema(getHomePageSchemaGraph()),
        }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 py-8 lg:px-8">
        <Hero />
        <MessagePipeline />
        <ProductGrid />
        <DashboardPreview />
        <DeveloperExperience />
        <Metrics />
        <Cta />
      </div>
    </main>
  );
}
