import type { Metadata } from "next";
import Link from "next/link";

import { AnimatedGrid } from "@/components/marketing/hero/animated-grid";
import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { Reveal } from "@/components/marketing/reveal";
import { Separator } from "@/components/ui/separator";
import {
    Building2,
    KeyRound,
    Lock,
    Mail,
    ScrollText,
    ShieldCheck,
    UserCheck,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Security Infrastructure | Dugble",
    description:
        "Learn how Dugble protects A2P messaging workflows with server-side keys, signed webhooks, CSRF tokens, and session checks.",
    openGraph: {
        title: "Security Infrastructure | Dugble",
        description:
            "Learn how Dugble protects A2P messaging workflows with server-side keys, signed webhooks, CSRF tokens, and session checks.",
        url: "https://dugble.com/security",
    },
};

const controls = [
    {
        title: "Server-side API keys",
        description:
            "Keys are scoped to a workspace and meant to live on your server, never in client code.",
        icon: KeyRound,
    },
    {
        title: "Webhook signatures",
        description:
            "Every event is signed so your backend can verify it came from Dugble before acting on it.",
        icon: ShieldCheck,
    },
    {
        title: "CSRF tokens for unsafe dashboard actions",
        description:
            "State-changing requests in the dashboard require a valid, single-use token.",
        icon: Lock,
    },
    {
        title: "Session checks for authenticated routes",
        description:
            "Every authenticated request is checked against a live, revocable session.",
        icon: UserCheck,
    },
    {
        title: "Workspace-scoped access",
        description:
            "Keys, senders, logs, and members are isolated per workspace by default.",
        icon: Building2,
    },
    {
        title: "Audit log foundation",
        description:
            "Sensitive workspace actions are recorded so you can reconstruct what changed and when.",
        icon: ScrollText,
    },
];

export default function Page() {
    return (
        <main className="min-h-svh bg-background text-foreground">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-8 lg:px-8">
                <section className="relative isolate overflow-hidden py-12">
                    <AnimatedGrid />
                    <FloatingOrbs />
                    <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8">
                        <Reveal className="space-y-6">
                            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                                Security
                            </p>
                            <h1 className="max-w-xl text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                                Security for message-sending infrastructure.
                            </h1>
                            <p className="max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
                                Dugble protects the surfaces that matter for A2P
                                workflows: keys, sessions, webhooks, workspace
                                access, and message logs.
                            </p>
                        </Reveal>

                        <Reveal
                            delay={120}
                            className="overflow-hidden rounded-2xl border bg-card"
                        >
                            <div className="flex items-center justify-between border-b px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                                <span>Incoming webhook</span>
                                <span className="text-signal">verified</span>
                            </div>
                            <div className="space-y-3 p-4 font-mono text-[13px] leading-6">
                                <p className="text-foreground/80">
                                    X-Dugble-Signature:
                                </p>
                                <p className="truncate text-muted-foreground">
                                    t=1721642042,v1=5f3d8c9e2a1b...
                                </p>
                                <div className="flex items-center gap-2 border-t pt-3 text-signal">
                                    <ShieldCheck className="size-4" />
                                    <span>
                                        Signature matches — safe to process
                                    </span>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                <Separator />

                <Reveal as="section" className="space-y-3">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        What's in place today
                    </p>
                    <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                        Six controls, built in from the start.
                    </h2>
                </Reveal>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {controls.map((control, index) => (
                        <Reveal
                            key={control.title}
                            delay={index * 75}
                            className="group rounded-2xl border bg-card/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-signal/40 hover:shadow-[0_0_0_1px_rgba(62,217,142,0.15)]"
                        >
                            <div className="mb-4 flex size-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors group-hover:text-signal">
                                <control.icon className="size-4" />
                            </div>
                            <h3 className="font-heading text-lg font-semibold tracking-tight">
                                {control.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {control.description}
                            </p>
                        </Reveal>
                    ))}
                </section>

                <Reveal
                    as="section"
                    className="rounded-2xl border bg-muted/30 p-6 md:p-8"
                >
                    <p className="max-w-2xl leading-7 text-muted-foreground">
                        Dugble is early-stage and doesn't hold formal
                        certifications like SOC 2 yet. What's above reflects
                        what's actually built today, not a compliance checklist
                        and it's the foundation we're building toward that on
                        top of.
                    </p>
                </Reveal>

                <Reveal
                    as="section"
                    className="flex flex-col items-start justify-between gap-6 rounded-2xl border bg-card p-6 md:flex-row md:items-center md:p-8"
                >
                    <div className="max-w-xl space-y-2">
                        <h2 className="font-heading text-2xl font-semibold tracking-tight">
                            Found something?
                        </h2>
                        <p className="leading-7 text-muted-foreground">
                            If you believe you've found a security issue in
                            Dugble, we'd rather hear it from you first.
                        </p>
                    </div>
                    <Link
                        href="mailto:security@dugble.com"
                        className="group/button relative inline-flex h-11 shrink-0 items-center gap-2 overflow-hidden rounded-full border bg-background px-4 font-mono text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-lg hover:shadow-black/20"
                    >
                        <Mail className="size-4 text-signal" />
                        security@dugble.com
                        <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                        />
                    </Link>
                </Reveal>
            </div>
        </main>
    );
}
