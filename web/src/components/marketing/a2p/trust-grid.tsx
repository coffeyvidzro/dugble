import { Globe2, type LucideIcon, ShieldCheck } from "lucide-react";

import { Reveal } from "../reveal";

const items: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Globe2,
    title: "Built for A2P from day one",
    description:
      "Not a general messaging SDK with A2P bolted on routing, retries, and status states are designed around OTPs and account notifications specifically.",
  },
  {
    icon: ShieldCheck,
    title: "One trust boundary",
    description:
      "A single API key and signed webhook contract covers every channel, so adding email doesn't mean learning a second security model.",
  },
];

export function TrustGrid() {
  return (
    <section className="grid gap-6 rounded-2xl border bg-card/60 p-6 sm:grid-cols-2 md:p-8">
      {items.map((item, i) => (
        <Reveal
          key={item.title}
          delay={i * 80}
          className="flex items-start gap-4"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-signal">
            <item.icon className="size-4" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold tracking-tight">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </div>
        </Reveal>
      ))}
    </section>
  );
}
