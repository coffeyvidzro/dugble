import { Reveal } from "@/components/marketing/reveal";

const details = [
  {
    title: "Stable IDs",
    description:
      "Every accepted request returns a message_id your team can search, store, and trace.",
    icon: <path d="M4 6h16M4 12h10M4 18h13" />,
  },
  {
    title: "Idempotent sends",
    description:
      "Use idempotency_key for retries so network failures do not create duplicate OTPs.",
    icon: (
      <path d="M12 4v4m0 8v4m8-8h-4M8 12H4m12.5-4.5-2.8 2.8m-7.4 7.4-2.8 2.8m0-13 2.8 2.8m7.4 7.4 2.8 2.8" />
    ),
  },
  {
    title: "Failure reasons",
    description:
      "Expose provider responses and normalized errors so support is not guessing.",
    icon: (
      <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    ),
  },
  {
    title: "Webhook events",
    description:
      "Handle message.sent, message.delivered, and message.failed in your backend.",
    icon: <path d="M12 2v4m0 0a4 4 0 1 0 4 4M8 14.5 5.5 20M16 14.5 18.5 20" />,
  },
];

export function SmsLifecycle() {
  return (
    <section className="grid gap-8 lg:grid-cols-[0.65fr_1fr]">
      <Reveal className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Lifecycle
        </p>
        <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight">
          Trace the whole lifecycle.
        </h2>
        <p className="leading-7 text-muted-foreground">
          When a user says they did not get the code, you should know exactly
          where it stopped, not guess.
        </p>
      </Reveal>

      <div className="grid gap-3 sm:grid-cols-2">
        {details.map((detail, index) => (
          <Reveal
            key={detail.title}
            delay={index * 100}
            className="group rounded-xl border bg-card/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-signal/40 hover:shadow-[0_0_0_1px_rgba(62,217,142,0.15)]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-4 size-5 text-muted-foreground transition-colors group-hover:text-signal"
            >
              {detail.icon}
            </svg>
            <h3 className="font-heading text-lg font-semibold tracking-tight">
              {detail.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {detail.description}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
