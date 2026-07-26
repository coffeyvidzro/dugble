import type { Metadata } from "next";
import Link from "next/link";
import { ContactChannels } from "@/components/marketing/contact-channels";
import { ContactForm } from "@/components/marketing/contact-form";
import { AnimatedGrid } from "@/components/marketing/hero/animated-grid";
import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { Reveal } from "@/components/marketing/reveal";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Reach out to Dugble for early access, product feedback, volume SMS, partnerships, or support.",
  openGraph: {
    title: "Contact Us",
    description:
      "Reach out to Dugble for early access, product feedback, volume SMS, partnerships, or support.",
    url: "/contact",
  },
};

const reasons = [
  "Early access",
  "Product feedback",
  "Volume SMS",
  "Partnerships",
  "Support",
];

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-8 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-2xl px-6 py-16">
          <AnimatedGrid />
          <FloatingOrbs />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10">
            <div className="animate-fade-up space-y-6">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                Contact
              </p>
              <h1 className="max-w-xl text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                Talk to Dugble about A2P messaging.
              </h1>
              <p className="max-w-lg text-pretty text-lg leading-8 text-muted-foreground">
                Reach out if you're building OTP, alert, receipt, or
                notification workflows and want sharper infrastructure behind
                them.
              </p>
              <Link
                href="#contact-form"
                className={buttonVariants({ size: "lg" })}
              >
                Send us a message
              </Link>
            </div>

            <div className="animate-fade-up space-y-4 rounded-2xl border bg-card p-6 [animation-delay:120ms]">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Reach out about
              </p>
              <div className="flex flex-wrap gap-2">
                {reasons.map((reason) => (
                  <span
                    key={reason}
                    className="rounded-full border bg-background px-3.5 py-1.5 text-sm transition-colors hover:border-signal/40 hover:text-signal"
                  >
                    {reason}
                  </span>
                ))}
              </div>
              <div className="border-t pt-4">
                <Link
                  href="mailto:hello@dugble.com"
                  className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="text-signal">$</span>
                  Email: hello@dugble.com
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-12">
          <Reveal className="space-y-6 rounded-2xl border bg-card/60 p-6 md:p-8">
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Send a message
              </p>
              <h2 className="text-balance font-heading text-2xl font-semibold tracking-tight">
                Tell us what you're building.
              </h2>
            </div>
            <ContactForm />
          </Reveal>

          <Reveal delay={120} className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Other ways to reach us
            </p>
            <ContactChannels />
          </Reveal>
        </section>
      </div>
    </main>
  );
}
