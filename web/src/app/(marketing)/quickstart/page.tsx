import type { Metadata } from "next";
import Link from "next/link";

import { AnimatedGrid } from "@/components/marketing/hero/animated-grid";
import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { Reveal } from "@/components/marketing/reveal";
import { Separator } from "@/components/ui/separator";
import { Cta } from "@/components/marketing/cta";
import {
    Building2,
    CheckCircle2,
    Clock,
    KeyRound,
    LifeBuoy,
    Radio,
    Search,
    Smartphone,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Quickstart Guide | Dugble",
    description:
        "Get started with Dugble in under 5 minutes. Learn how to create a workspace, generate an API key, send a test SMS, and configure webhooks.",
    openGraph: {
        title: "Quickstart Guide | Dugble",
        description:
            "Get started with Dugble in under 5 minutes. Learn how to create a workspace, generate an API key, send a test SMS, and configure webhooks.",
        url: "https://dugble.com/quickstart",
    },
};

const steps = [
    {
        number: "01",
        title: "Create a workspace",
        description:
            "Keep API keys, senders, logs, and webhooks grouped by product or environment.",
        icon: Building2,
        code: null as string | null,
    },
    {
        number: "02",
        title: "Generate an API key",
        description:
            "Use server-side keys for authenticated email and SMS requests.",
        icon: KeyRound,
        code: `DUGBLE_API_KEY=sk_live_51ac9f2e...
DUGBLE_ENV=production`,
    },
    {
        number: "03",
        title: "Send a test SMS",
        description:
            "Start with OTP or alert payloads and confirm you receive a message_id.",
        icon: Smartphone,
        code: `curl https://api.dugble.com/v1/messages \\
  -H "Authorization: Bearer $DUGBLE_API_KEY" \\
  -d channel="sms" -d to="+233531184325" \\
  -d template="login_otp"`,
    },
    {
        number: "04",
        title: "Add a webhook",
        description:
            "Point Dugble at an endpoint that can receive message.delivered and message.failed.",
        icon: Radio,
        code: `POST /webhooks/dugble
X-Dugble-Event: message.delivered
X-Dugble-Signature: t=1721642042,v1=5f3d8c9e...`,
    },
    {
        number: "05",
        title: "Check logs",
        description:
            "Search by message_id or recipient to confirm status, provider response, and webhook attempts.",
        icon: Search,
        code: `dugble logs --message-id msg_9c41af
> queued → sent → delivered (812ms)`,
    },
];

const prerequisites = [
    "A Dugble account (sandbox is free)",
    "curl, or any HTTP client",
    "An endpoint that can receive a webhook POST",
];

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
                <section className="relative isolate overflow-hidden py-12 rounded-2xl px-6">
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
                            The first Dugble integration should prove three
                            things: your request is accepted, your message can
                            be traced, and your backend receives delivery
                            events.
                        </p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 font-mono text-xs text-muted-foreground">
                            <span className="text-foreground">
                                Before you start:
                            </span>
                            {prerequisites.map((item) => (
                                <span key={item}>{item}</span>
                            ))}
                        </div>
                    </Reveal>
                </section>

                <Separator />

                <section>
                    {steps.map((step, i) => (
                        <Reveal
                            key={step.number}
                            delay={i * 100}
                            className="relative grid gap-5 pb-12 last:pb-0 md:grid-cols-[3rem_1fr] md:gap-8"
                        >
                            {i < steps.length - 1 && (
                                <span
                                    aria-hidden
                                    className="absolute left-6 top-12 hidden h-[calc(100%-1.5rem)] w-px bg-border md:block"
                                />
                            )}
                            <div className="relative z-10 flex size-12 items-center justify-center rounded-full border bg-card text-signal">
                                <step.icon className="size-5" />
                            </div>
                            <div className="space-y-3">
                                <p className="font-mono text-xs text-muted-foreground">
                                    Step {step.number}
                                </p>
                                <h2 className="font-heading text-2xl font-semibold tracking-tight">
                                    {step.title}
                                </h2>
                                <p className="max-w-xl leading-7 text-muted-foreground">
                                    {step.description}
                                </p>
                                {step.code && (
                                    <pre className="overflow-x-auto rounded-xl border bg-card p-4 font-mono text-[13px] leading-6 text-foreground/90">
                                        {step.code}
                                    </pre>
                                )}
                            </div>
                        </Reveal>
                    ))}
                </section>

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
                        After the first test message, you should have a message
                        ID, an initial queued state, a searchable log entry, and
                        a webhook event path ready for delivery updates.
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
                            Stuck on a step? The full API reference has request
                            and response examples for every endpoint.
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
