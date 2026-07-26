import { Reveal } from "@/components/marketing/reveal";

const features = [
  {
    title: "Template data",
    description:
      "Pass structured JSON into reusable transactional templates without mixing product logic into email copy.",
    icon: <path d="M4 6h16M4 12h10M4 18h13" />,
  },
  {
    title: "Bounces and failures",
    description:
      "Expose bounced, failed, and provider-response states so teams can support customers quickly.",
    icon: (
      <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    ),
  },
  {
    title: "Message logs",
    description:
      "Search by message_id, recipient, template, or request ID when something goes wrong.",
    icon: <path d="M11 4a7 7 0 1 0 4.9 12L21 21m-10-9h6m-3-3v6" />,
  },
];

export function EmailFeatures() {
  return (
    <section className="space-y-8">
      <Reveal className="max-w-2xl space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Built in
        </p>
        <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Everything a transactional send actually needs.
        </h2>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature, index) => (
          <Reveal
            key={feature.title}
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
              {feature.icon}
            </svg>
            <h3 className="font-heading text-lg font-semibold tracking-tight">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {feature.description}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
