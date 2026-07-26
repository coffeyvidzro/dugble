import { Reveal } from "@/components/marketing/reveal";
import {
    Mail,
    Radio,
    ShieldCheck,
    Smartphone,
    UserCheck,
    Users,
} from "lucide-react";

const messagingItems = [
    { icon: Smartphone, label: "SMS API" },
    { icon: Mail, label: "Email API" },
    { icon: Radio, label: "Signed webhooks" },
];

const identityItems = [
    { icon: UserCheck, label: "Browser authentication" },
    { icon: Users, label: "Team membership" },
    { icon: ShieldCheck, label: "Scoped team tokens" },
];

export function ArchitectureLayers() {
    return (
        <section className="space-y-8">
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    What it actually is
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    A messaging API, built on real identity infrastructure.
                </h2>
                <p className="leading-7 text-muted-foreground">
                    Underneath the SMS and Email APIs is a lightweight Go HTTP
                    server handling multi-tenant identity and team management,
                    the same foundation a full product needs, not a messaging
                    script with an API bolted on top.
                </p>
            </Reveal>

            <Reveal delay={80} className="space-y-3">
                <div className="rounded-2xl border bg-card/60 p-6">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                        Messaging layer
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        What you integrate against
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {messagingItems.map((item) => (
                            <span
                                key={item.label}
                                className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm"
                            >
                                <item.icon className="size-3.5 text-muted-foreground" />
                                {item.label}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center">
                    <div className="h-6 w-px bg-border" />
                </div>

                <div className="rounded-2xl border bg-card/60 p-6">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Identity &amp; team layer
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        What makes it a real multi-tenant platform
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {identityItems.map((item) => (
                            <span
                                key={item.label}
                                className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm"
                            >
                                <item.icon className="size-3.5 text-muted-foreground" />
                                {item.label}
                            </span>
                        ))}
                    </div>
                </div>
            </Reveal>
        </section>
    );
}
