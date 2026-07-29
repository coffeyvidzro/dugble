import { FlaskConical, Smartphone, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const channels = [
  {
    icon: FlaskConical,
    title: "Sandbox",
    tag: "Free",
    description:
      "Unlimited test-mode sends. Nothing here ever counts toward a plan's included volume. It never reaches a real inbox or phone.",
  },
  {
    icon: Smartphone,
    title: "SMS",
    tag: "Usage-based",
    description:
      "A2P SMS pricing varies by destination country and carrier, so it isn't a flat rate card the way email is. Talk to us for a quote.",
  },
  {
    icon: TrendingUp,
    title: "High volume",
    tag: "Custom",
    description:
      "Sustained email volume above 500,000/month, or SMS at scale. This is a conversation, not a self-serve tier.",
  },
];

export function OtherChannels() {
  return (
    <section className="space-y-6">
      <Reveal className="max-w-2xl space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Other channels
        </p>
        <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Not everything fits a calculator.
        </h2>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-3">
        {channels.map((channel, i) => (
          <Reveal
            key={channel.title}
            delay={i * 80}
            className="rounded-2xl border bg-card/60 p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                <channel.icon className="size-4" />
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                {channel.tag}
              </span>
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">
              {channel.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {channel.description}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
