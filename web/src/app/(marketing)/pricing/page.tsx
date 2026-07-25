import type { Metadata } from "next";

import { AnimatedGrid } from "@/components/marketing/hero/animated-grid";
import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { Reveal } from "@/components/marketing/reveal";
import { Separator } from "@/components/ui/separator";
import { Cta } from "@/components/marketing/cta";
import {
    FlaskConical,
    Gauge,
    Mail,
    Smartphone,
    TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Pricing & Plans | Dugble",
    description:
        "Explore Dugble's transparent, usage-based pricing for transactional email and A2P SMS messaging. No setup fees or feature paywalls.",
    openGraph: {
        title: "Pricing & Plans | Dugble",
        description:
            "Explore Dugble's transparent, usage-based pricing for transactional email and A2P SMS messaging. No setup fees or feature paywalls.",
        url: "https://dugble.com/pricing",
    },
};

const lines = [
    {
        title: "Sandbox",
        description: "Build and test before sending production traffic.",
        tag: "Free",
        icon: FlaskConical,
    },
    {
        title: "Email",
        description: "Transactional email usage tracked separately from SMS.",
        tag: "Per message",
        icon: Mail,
    },
    {
        title: "SMS",
        description: "A2P SMS usage based on production message volume.",
        tag: "Per message",
        icon: Smartphone,
    },
    {
        title: "Volume",
        description: "Talk to Dugble when OTP or notification traffic grows.",
        tag: "Custom",
        icon: TrendingUp,
    },
];

const included = [
    {
        title: "Unlimited sandbox testing",
        description:
            "Send as many test messages as you need before going live.",
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
        q: "Does sandbox traffic count toward my bill?",
        a: "No. Sandbox messages are free and unlimited. You're only billed once you send from a production sender.",
    },
    {
        q: "Can I mix email and SMS on one workspace?",
        a: "Yes. Usage for each channel is metered and shown separately, so one doesn't obscure the other.",
    },
    {
        q: "What happens if my volume spikes?",
        a: "You keep sending. We reach out before it becomes a pricing conversation, not after.",
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
                <section className="relative isolate overflow-hidden py-12 rounded-2xl px-6">
                    <AnimatedGrid />
                    <FloatingOrbs />
                    <Reveal className="relative space-y-6">
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                            Pricing
                        </p>
                        <h1 className="max-w-3xl text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                            Usage-based pricing by channel.
                        </h1>
                        <p className="max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
                            Dugble pricing stays easy to reason about: email and
                            SMS are separate, test traffic is visible, and
                            production volume maps to the messages your product
                            actually sends.
                        </p>
                    </Reveal>
                </section>

                <Separator />

                <section className="grid gap-4 sm:grid-cols-2">
                    {lines.map((line, index) => (
                        <Reveal
                            key={line.title}
                            delay={index * 75}
                            className="group rounded-2xl border bg-card/60 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-signal/40 hover:shadow-[0_0_0_1px_rgba(62,217,142,0.15)]"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors group-hover:text-signal">
                                    <line.icon className="size-4" />
                                </div>
                                <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                                    {line.tag}
                                </span>
                            </div>
                            <h2 className="mt-4 font-heading text-xl font-semibold tracking-tight">
                                {line.title}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {line.description}
                            </p>
                        </Reveal>
                    ))}
                </section>

                <section className="grid gap-8 rounded-2xl border bg-card/60 p-6 md:p-8 lg:grid-cols-[0.7fr_1fr] lg:gap-10">
                    <Reveal className="space-y-3">
                        <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-signal">
                            <Gauge className="size-4" />
                        </div>
                        <h2 className="font-heading text-2xl font-semibold tracking-tight">
                            Included on every plan
                        </h2>
                        <p className="leading-7 text-muted-foreground">
                            No feature paywall. The dashboard, logs, and
                            webhooks are the same whether you're testing or
                            sending at volume.
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
                                <p className="text-sm font-medium">
                                    {item.title}
                                </p>
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
                                <p className="leading-6 text-muted-foreground">
                                    {faq.a}
                                </p>
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
