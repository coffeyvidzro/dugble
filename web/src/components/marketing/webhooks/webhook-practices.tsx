import { Reveal } from "@/components/marketing/reveal";

const practices = [
  {
    title: "Verify signatures",
    description:
      "Reject events that fail the X-Dugble-Signature check before updating product state.",
    icon: (
      <path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4Zm-1.5 11.5L8 11l1.4-1.4 1.1 1.1 3.1-3.1L15 9Z" />
    ),
  },
  {
    title: "Handle retries",
    description:
      "Return a 2xx response only after your endpoint has safely processed the event.",
    icon: (
      <path d="M4 4v5h5M20 20v-5h-5M4.6 9A8 8 0 0 1 19 8m.4 7A8 8 0 0 1 5 16" />
    ),
  },
  {
    title: "Store event IDs",
    description:
      "Deduplicate webhook deliveries so repeated attempts do not mutate data twice.",
    icon: <path d="M4 6h16M4 12h16M4 18h10" />,
  },
];

export function WebhookPractices() {
  return (
    <section className="space-y-8">
      <Reveal className="max-w-2xl space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Best practices
        </p>
        <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Build a handler that won't break under retries.
        </h2>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-3">
        {practices.map((practice, index) => (
          <Reveal
            key={practice.title}
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
              {practice.icon}
            </svg>
            <h3 className="font-heading text-lg font-semibold tracking-tight">
              {practice.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {practice.description}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
