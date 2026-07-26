import { Metadata } from "next";

import { EmailContract } from "@/components/marketing/email/email-contract";
import { EmailFeatures } from "@/components/marketing/email/email-features";
import { EmailEvents } from "@/components/marketing/email/email-events";
import { EmailHero } from "@/components/marketing/email/email-hero";
import { Separator } from "@/components/ui/separator";
import { Cta } from "@/components/marketing/cta";

export const metadata: Metadata = {
    title: "Email API",
    description:
        "Send receipts, password resets, and lifecycle emails reliably with Dugble's developer-first API.",
    openGraph: {
        title: "Email API",
        description:
            "Send receipts, password resets, and lifecycle emails reliably with Dugble's developer-first API.",
        url: "/features/email-api",
        type: "website",
    },
};

export default function Page() {
    return (
        <main className="min-h-svh bg-background text-foreground">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-8 lg:px-8">
                <EmailHero />
                <Separator />
                <EmailContract />
                <EmailFeatures />
                <EmailEvents />
                <Cta />
            </div>
        </main>
    );
}
