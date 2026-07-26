import {
  ArrowRight,
  type LucideIcon,
  Mail,
  Radio,
  Smartphone,
} from "lucide-react";

import { Reveal } from "../reveal";

const explore: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    href: "/features/sms-api",
    title: "SMS API",
    description: "OTP, alerts, and transactional A2P SMS.",
    icon: Smartphone,
  },
  {
    href: "/features/email-api",
    title: "Email API",
    description: "Receipts, password resets, and lifecycle email.",
    icon: Mail,
  },
  {
    href: "/features/webhooks",
    title: "Webhooks",
    description: "Delivery events, retries, and signatures.",
    icon: Radio,
  },
];

export function ExploreChannels() {
  return (
    <section className="space-y-6">
      <Reveal className="max-w-2xl space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Go deeper
        </p>
        <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Explore each channel.
        </h2>
      </Reveal>
      <div className="grid gap-4 md:grid-cols-3">
        {explore.map((item, i) => (
          <Reveal key={item.href} delay={i * 80}>
            <a
              href={item.href}
              className="group block h-full rounded-xl border bg-card/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-signal/40 hover:shadow-[0_0_0_1px_rgba(62,217,142,0.15)]"
            >
              <item.icon className="mb-4 size-5 text-muted-foreground transition-colors group-hover:text-signal" />
              <h3 className="font-heading text-lg font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                Learn more about {item.title}
                <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
