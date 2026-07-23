import { Reveal } from "@/components/marketing/reveal";

const pillars = [
    {
        title: "Email API",
        description:
            "Transactional email for receipts, alerts, onboarding, and lifecycle messaging with clear delivery events.",
        icon: (
            <path d="M3 6.5 12 13l9-6.5M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
        ),
    },
    {
        title: "SMS API",
        description:
            "Deliver OTPs, login codes, reminders, and notifications through developer-friendly A2P workflows.",
        icon: (
            <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM11 17h2" />
        ),
    },
    {
        title: "Webhooks",
        description:
            "Receive delivery, failure, retry, and engagement events so your product reacts to every message state.",
        icon: (
            <path d="M12 2v4m0 0a4 4 0 1 0 4 4M8 14.5 5.5 20M16 14.5 18.5 20" />
        ),
    },
    {
        title: "Message logs",
        description:
            "Trace requests, inspect provider responses, and debug failed notifications without guesswork.",
        icon: <path d="M4 6h16M4 12h10M4 18h13" />,
    },
];

export function ProductGrid() {
    return (
        <section className="space-y-8">
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Product surface
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    The messaging primitives your product needs.
                </h2>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {pillars.map((pillar, index) => (
                    <Reveal
                        key={pillar.title}
                        delay={index * 100}
                        className="group relative overflow-hidden rounded-xl border bg-card/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-signal/40 hover:shadow-[0_0_0_1px_rgba(62,217,142,0.15)]"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mb-4 size-6 text-muted-foreground transition-colors group-hover:text-signal"
                        >
                            {pillar.icon}
                        </svg>
                        <h3 className="font-heading text-lg font-semibold tracking-tight">
                            {pillar.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {pillar.description}
                        </p>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}
