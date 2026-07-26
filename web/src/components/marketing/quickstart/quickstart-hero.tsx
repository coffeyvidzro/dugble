import { Clock } from "lucide-react";
import { AnimatedGrid } from "@/components/marketing/hero/animated-grid";
import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { Reveal } from "@/components/marketing/reveal";

const prerequisites = [
  "A Dugble account (sandbox is free)",
  "curl, or any HTTP client",
  "An endpoint that can receive a webhook POST",
];

export function QuickstartHero() {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl px-6 py-12">
      <AnimatedGrid />
      <FloatingOrbs />
      <Reveal className="relative space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 py-1.5 pl-2.5 pr-3.5 font-mono text-xs text-muted-foreground">
          <Clock className="size-3.5 text-signal" />
          Typically under 5 minutes
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
          Quickstart
        </p>
        <h1 className="max-w-3xl text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
          From API key to traceable message.
        </h1>
        <p className="max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
          The first Dugble integration should prove three things: your request
          is accepted, your message can be traced, and your backend receives
          delivery events.
        </p>
        <div className="flex flex-wrap gap-x-2 gap-y-2 pt-2 font-mono text-xs text-muted-foreground">
          <span className="text-foreground">Before you start:</span>
          {prerequisites.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
