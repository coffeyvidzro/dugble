import {
    ArrowRight,
    FileCheck2,
    KeyRound,
    ShieldCheck,
    UserCheck,
} from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/marketing/reveal";

const points = [
    { icon: KeyRound, label: "Scoped, revocable API tokens per workspace" },
    {
        icon: ShieldCheck,
        label: "HMAC-signed webhooks on every delivery event",
    },
    {
        icon: FileCheck2,
        label: "Support for A2P 10DLC and sender ID registration",
    },
    {
        icon: UserCheck,
        label: "A named security contact for the length of the engagement",
    },
];

export function SecurityNote() {
    return (
        <section
            id="security"
            className="croll-mt-(--cs-sticky-offset,8rem) rounded-2xl border bg-card/60 p-6 md:p-8"
        >
            <Reveal className="grid gap-6 md:grid-cols-2 md:items-center">
                <div className="space-y-3">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Security
                    </p>
                    <h2 className="text-balance font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                        The same security model, extended for you.
                    </h2>
                    <p className="leading-7 text-muted-foreground">
                        Custom infrastructure doesn&apos;t mean a different set
                        of guarantees. It&apos;s the same scoped-token and
                        signed-webhook model every workspace runs on, with the
                        registration and dedicated-infrastructure work handled
                        for you.
                    </p>
                    <Link
                        href="/security"
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-signal"
                    >
                        Read the full security model
                        <ArrowRight className="size-3.5" />
                    </Link>
                </div>
                <ul className="space-y-3">
                    {points.map((point) => (
                        <li
                            key={point.label}
                            className="flex items-start gap-3 text-sm text-muted-foreground"
                        >
                            <point.icon className="mt-0.5 size-4 shrink-0 text-signal" />
                            {point.label}
                        </li>
                    ))}
                </ul>
            </Reveal>
        </section>
    );
}
