import { AnimatedGrid } from "@/components/marketing/hero/animated-grid";
import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";

export function AboutHero() {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl px-6 py-16">
      <AnimatedGrid />
      <FloatingOrbs />

      <div className="relative animate-fade-up space-y-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
          About Dugble
        </p>
        <h1 className="max-w-2xl text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
          Messaging infrastructure should be easier to debug.
        </h1>
        <p className="max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
          Dugble is being built for teams that send customer-critical messages,
          OTPs, receipts, alerts, and updates - and need to know exactly what
          happened after every API call.
        </p>
        <p className="max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
          The point of view is simple: send the message, keep the receipt, and
          make every failure easier to explain.
        </p>
      </div>
    </section>
  );
}
