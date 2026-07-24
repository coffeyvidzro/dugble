import { Metadata } from "next";

import { WebhookPractices } from "@/components/marketing/webhooks/webhook-practices";
import { WebhookContract } from "@/components/marketing/webhooks/webhook-contract";
import { WebhookEvents } from "@/components/marketing/webhooks/webhook-events";
import { WebhookHero } from "@/components/marketing/webhooks/webhook-hero";
import { Separator } from "@/components/ui/separator";
import { Cta } from "@/components/marketing/cta";

export const metadata: Metadata = {
    title: "Webhooks | Dugble",
    description:
        "Trace your message lifecycle with real-time delivery events, automated retries, and secure cryptographic signatures.",
    openGraph: {
        title: "Webhooks | Dugble",
        description:
            "Trace your message lifecycle with real-time delivery events, automated retries, and secure cryptographic signatures.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Webhooks | Dugble",
        description:
            "Trace your message lifecycle with real-time delivery events, automated retries, and secure cryptographic signatures.",
    },
};

export default function Page() {
    return (
        <main className="min-h-svh bg-background text-foreground">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-8 lg:px-8">
                <WebhookHero />
                <Separator />
                <WebhookContract />
                <WebhookPractices />
                <WebhookEvents />
                <Cta />
            </div>
        </main>
    );
}
