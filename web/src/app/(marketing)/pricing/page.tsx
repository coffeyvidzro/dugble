import { Gauge } from "lucide-react";
import type { Metadata } from "next";
import { Cta } from "@/components/marketing/cta";
import { AnimatedGrid } from "@/components/marketing/hero/animated-grid";
import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { EmailPricing } from "@/components/marketing/pricing/email-pricing";
import { Reveal } from "@/components/marketing/reveal";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Pricing & Plans",
  description:
    "Explore Dugble's transparent, usage-based pricing for transactional email. No setup fees or feature paywalls.",
  openGraph: {
    title: "Pricing & Plans",
    description:
      "Explore Dugble's transparent, usage-based pricing for transactional email. No setup fees or feature paywalls.",
    url: "/pricing",
    type: "website",
  },
};

const included = [
  {
    title: "Unlimited sandbox testing",
    description:
      "Test-mode sends never count toward a plan's included volume. It is separate from your production allowance entirely.",
  },
  {
    title: "Full dashboard and message logs",
    description: "Search and trace every message, not a limited preview.",
  },
  {
    title: "Webhooks on every plan",
    description: "Delivery events aren't a paid add-on.",
  },
  {
    title: "No setup or platform fee",
    description: "Pay for messages sent, not for access to the API.",
  },
];

const faqs = [
  {
    q: "How is email usage counted?",
    a: "Per recipient. One message sent to ten recipients counts as ten emails, not one.",
  },
  {
    q: "How is overage billed?",
    a: "In blocks of 1,000 emails, at your plan's overage rate. The Free plan has no overage. Sending stops until you upgrade.",
  },
  {
    q: "Does sandbox traffic count toward my bill?",
    a: "No. Sandbox messages are free and unlimited. You're only billed once you send from a production sender.",
  },
  {
    q: "Is there a contract or minimum commitment?",
    a: "No minimums at standard volume. High-volume workspaces can talk to us about a custom arrangement.",
  },
];

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-8 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-2xl px-6 py-12">
          <AnimatedGrid />
          <FloatingOrbs />
          <Reveal className="relative space-y-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
              Pricing
            </p>
            <h1 className="max-w-3xl text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
              Straightforward email pricing.
            </h1>
            <p className="max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
              Dugble email pricing stays easy to reason about: test traffic is
              visible, and production volume maps to the messages your product
              actually sends.
            </p>
          </Reveal>
        </section>

        <Separator />

        <EmailPricing />

        <section className="grid gap-8 rounded-2xl border bg-card/60 p-6 md:p-8 lg:grid-cols-[0.7fr_1fr] lg:gap-10">
          <Reveal className="space-y-3">
            <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-signal">
              <Gauge className="size-4" />
            </div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Included on every plan
            </h2>
            <p className="leading-7 text-muted-foreground">
              No feature paywall. The dashboard, logs, and webhooks are the same
              whether you're testing or sending at volume.
            </p>
          </Reveal>
          <ul className="grid gap-3 sm:grid-cols-2">
            {included.map((item, index) => (
              <Reveal
                as="li"
                key={item.title}
                delay={index * 75}
                className="rounded-xl border bg-background px-4 py-3"
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="space-y-6">
          <Reveal className="max-w-2xl space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Billing questions
            </p>
            <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              Common questions before you commit.
            </h2>
          </Reveal>
          <div className="divide-y rounded-2xl border">
            {faqs.map((faq, index) => (
              <Reveal
                key={faq.q}
                delay={index * 75}
                className="grid gap-2 p-6 md:grid-cols-[280px_1fr] md:gap-6"
              >
                <h3 className="font-medium">{faq.q}</h3>
                <p className="leading-6 text-muted-foreground">{faq.a}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal>
          <Cta />
        </Reveal>
      </div>
    </main>
  );
}
