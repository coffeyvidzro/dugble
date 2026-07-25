import Link from "next/link";
import { Activity, Globe2, Mail, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";

const channels: {
    icon: LucideIcon;
    title: string;
    description: string;
    action: { label: string; href: string };
}[] = [
    {
        icon: Mail,
        title: "General inquiries",
        description:
            "Early access, feedback, partnerships, and everything else.",
        action: { label: "hello@dugble.com", href: "mailto:hello@dugble.com" },
    },
    {
        icon: ShieldCheck,
        title: "Security reports",
        description:
            "Found a vulnerability? We'd rather hear it from you first.",
        action: { label: "Read our security page", href: "/security" },
    },
    {
        icon: Activity,
        title: "Status & incidents",
        description:
            "Check current uptime before reaching out about an outage.",
        action: { label: "View status", href: "/status" },
    },
];

export function ContactChannels() {
    return (
        <div className="space-y-4">
            {channels.map((channel, index) => (
                <Reveal
                    key={channel.title}
                    delay={index * 80}
                    className="rounded-2xl border bg-card/60 p-5"
                >
                    <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-signal">
                        <channel.icon className="size-4" />
                    </div>
                    <h3 className="mt-4 font-heading text-base font-semibold tracking-tight">
                        {channel.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                        {channel.description}
                    </p>
                    <Link
                        href={channel.action.href}
                        className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {channel.action.label}
                    </Link>
                </Reveal>
            ))}

            <Reveal
                delay={channels.length * 80}
                className="rounded-2xl border bg-muted/30 p-5"
            >
                <Globe2 className="mb-2 size-4 text-muted-foreground" />
                <p className="text-sm leading-6 text-muted-foreground">
                    Remote-first, building for African startups and teams - and
                    the developers writing to them from anywhere else.
                </p>
            </Reveal>
        </div>
    );
}
