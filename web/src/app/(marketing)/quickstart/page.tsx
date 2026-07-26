import { CheckCircle2, LifeBuoy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Cta } from "@/components/marketing/cta";
import { QuickstartHero } from "@/components/marketing/quickstart/quickstart-hero";
import { QuickstartSteps } from "@/components/marketing/quickstart/quickstart-steps";
import { Reveal } from "@/components/marketing/reveal";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Quickstart Guide",
  description:
    "Get started with Dugble in under 5 minutes. Learn how to create a workspace, generate an API key, send a test SMS, and configure webhooks.",
  openGraph: {
    title: "Quickstart Guide",
    description:
      "Get started with Dugble in under 5 minutes. Learn how to create a workspace, generate an API key, send a test SMS, and configure webhooks.",
    url: "/quickstart",
    type: "website",
  },
};

const successChecklist = [
  "message_id returned on accept",
  "queued status in the response",
  "log entry searchable by ID",
  "webhook path ready for events",
];

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-8 lg:px-8">
        <QuickstartHero />

        <Separator />

        <QuickstartSteps />

        <Reveal
          as="section"
          className="space-y-5 rounded-2xl border bg-card p-6 md:p-8"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 text-signal" />
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              What success looks like
            </h2>
          </div>
          <p className="max-w-2xl leading-7 text-muted-foreground">
            After the first test message, you should have a message ID, an
            initial queued state, a searchable log entry, and a webhook event
            path ready for delivery updates.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {successChecklist.map((item, index) => (
              <Reveal
                as="li"
                key={item}
                delay={index * 75}
                className="flex items-center gap-2.5 rounded-xl border bg-background px-4 py-3 text-sm"
              >
                <CheckCircle2 className="size-4 shrink-0 text-signal" />
                <span className="font-medium">{item}</span>
              </Reveal>
            ))}
          </ul>
        </Reveal>

        <Reveal
          as="section"
          className="flex flex-col items-start justify-between gap-4 rounded-2xl border bg-muted/30 p-6 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-3">
            <LifeBuoy className="size-5 text-muted-foreground" />
            <p className="text-muted-foreground">
              Stuck on a step? The full API reference has request and response
              examples for every endpoint.
            </p>
          </div>
          <Link
            href="/docs"
            className="shrink-0 font-mono text-sm text-foreground underline underline-offset-4 decoration-border hover:decoration-signal"
          >
            View docs
          </Link>
        </Reveal>

        <Reveal>
          <Cta />
        </Reveal>
      </div>
    </main>
  );
}
