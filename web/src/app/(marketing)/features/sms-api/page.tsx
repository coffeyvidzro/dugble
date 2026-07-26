import type { Metadata } from "next";
import { Cta } from "@/components/marketing/cta";
import { SmsContract } from "@/components/marketing/sms/sms-contract";
import { SmsHero } from "@/components/marketing/sms/sms-hero";
import { SmsLifecycle } from "@/components/marketing/sms/sms-lifecycle";
import { StatusFlow } from "@/components/marketing/sms/status-flow";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "SMS API",
  description:
    "Reliable API for OTPs, alerts, and transactional A2P SMS. Get stable message IDs and real-time delivery tracking.",
  openGraph: {
    title: "SMS API",
    description:
      "Reliable API for OTPs, alerts, and transactional A2P SMS. Get stable message IDs and real-time delivery tracking.",
    url: "/features/sms-api",
    type: "website",
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
