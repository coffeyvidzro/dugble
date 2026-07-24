import { Metadata } from "next";

import { SmsLifecycle } from "@/components/marketing/sms/sms-lifecycle";
import { SmsContract } from "@/components/marketing/sms/sms-contract";
import { StatusFlow } from "@/components/marketing/sms/status-flow";
import { SmsHero } from "@/components/marketing/sms/sms-hero";
import { Separator } from "@/components/ui/separator";
import { Cta } from "@/components/marketing/cta";

export const metadata: Metadata = {
    title: "SMS API | Dugble",
    description:
        "Reliable API for OTPs, alerts, and transactional A2P SMS. Get stable message IDs and real-time delivery tracking.",
    openGraph: {
        title: "SMS API | Dugble",
        description:
            "Reliable API for OTPs, alerts, and transactional A2P SMS. Get stable message IDs and real-time delivery tracking.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "SMS API | Dugble",
        description:
            "Reliable API for OTPs, alerts, and transactional A2P SMS. Get stable message IDs and real-time delivery tracking.",
    },
};

export default function Page() {
    return (
        <main className="min-h-svh bg-background text-foreground">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-8 lg:px-8">
                <SmsHero />
                <Separator />
                <SmsContract />
                <SmsLifecycle />
                <StatusFlow />
                <Cta />
            </div>
        </main>
    );
}
