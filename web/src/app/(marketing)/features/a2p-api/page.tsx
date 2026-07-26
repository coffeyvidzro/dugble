import type { Metadata } from "next";
import {
  A2pHero,
  ChannelComparison,
  ExploreChannels,
  SendContract,
  TrustGrid,
} from "@/components/marketing/a2p";
import { Cta } from "@/components/marketing/cta";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "A2P Messaging API",
  description:
    "Send SMS and transactional email through a unified, developer-first A2P messaging API with real-time delivery tracking and signed webhooks.",
  openGraph: {
    title: "A2P Messaging API",
    description:
      "Send SMS and transactional email through a unified, developer-first A2P messaging API with real-time delivery tracking and signed webhooks.",
    url: "/features/a2p-api",
    type: "website",
  },
};

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-8 lg:px-8">
        <A2pHero />
        <Separator />
        <SendContract />
        <ChannelComparison />
        <TrustGrid />
        <ExploreChannels />
        <Cta />
      </div>
    </main>
  );
}
