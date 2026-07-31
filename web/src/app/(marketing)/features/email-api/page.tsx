import { Cta } from "@/components/marketing/cta";
import { EmailContract } from "@/components/marketing/email/email-contract";
import { EmailEvents } from "@/components/marketing/email/email-events";
import { EmailFeatures } from "@/components/marketing/email/email-features";
import { EmailHero } from "@/components/marketing/email/email-hero";
import { Separator } from "@/components/ui/separator";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Email API",
  description:
    "Send receipts, password resets, and lifecycle emails reliably with Dugble's developer-first API.",
  path: "/features/email-api",
});

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
