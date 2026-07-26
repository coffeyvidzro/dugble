import type { Metadata } from "next";
import Script from "next/script";

import { DeveloperExperience } from "@/components/marketing/hero/developer-experience";
import { DashboardPreview } from "@/components/marketing/hero/dashboard-preview";
import { MessagePipeline } from "@/components/marketing/hero/message-pipeline";
import { ProductGrid } from "@/components/marketing/hero/product-grid";
import { Metrics } from "@/components/marketing/hero/metrics";
import { Hero } from "@/components/marketing/hero/hero";
import { Cta } from "@/components/marketing/cta";

export const metadata: Metadata = {
    title: "Reliable A2P Messaging & Developer Infrastructure",
    description:
        "Send OTPs, receipts, alerts, and customer notifications with complete delivery transparency, signed webhooks, and developer-first logs.",
    openGraph: {
        title: "Reliable A2P Messaging & Developer Infrastructure",
        description:
            "Send OTPs, receipts, alerts, and customer notifications with complete delivery transparency, signed webhooks, and developer-first logs.",
        url: "https://dugble.com",
        siteName: "Dugble",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Reliable A2P Messaging Infrastructure",
        description:
            "Send OTPs, receipts, alerts, and customer notifications with complete delivery transparency.",
    },
};

export default function Home() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Dugble",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
        description:
            "Send OTPs, receipts, alerts, and customer notifications with complete delivery transparency, signed webhooks, and developer-first logs.",
        provider: {
            "@type": "Organization",
            name: "Dugble",
            url: "https://dugble.com",
        },
    };

    return (
        <main className="min-h-svh bg-background text-foreground">
            <Script
                id="schema-org"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
