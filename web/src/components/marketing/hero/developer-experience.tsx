import { Reveal } from "@/components/marketing/reveal";

const points = [
  {
    title: "Predictable REST APIs",
    description: "Consistent shapes and naming across every endpoint.",
  },
  {
    title: "Useful errors and request IDs",
    description: "Every failure tells you what broke and where to look.",
  },
  {
    title: "Webhook retries and signatures",
    description: "Failed deliveries retry automatically and verify safely.",
  },
  {
    title: "Test-mode friendly workflows",
    description: "Simulate sends and webhooks before going live.",
  },
  {
    title: "Idempotency for safe retries",
    description: "Retry a request safely without sending twice.",
  },
  {
    title: "Clear dashboard observability",
    description: "See every request, response, and event in one place.",
  },
];

const responseSnippet = `{
  "message_id": "msg_7ac931",
  "status": "queued",
  "channel": "sms",
  "to": "+233531184325",
  "created_at": "2026-07-22T09:14:02Z"
}`;

export function DeveloperExperience() {
  return (
    <section className="grid gap-10 rounded-2xl border bg-card/60 p-6 md:p-10 lg:grid-cols-2 lg:gap-8">
      <Reveal className="space-y-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Developer experience
        </p>
        <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Integration should feel predictable from the first call.
        </h2>
        <p className="leading-7 text-muted-foreground">
          Dugble is built around the details developers care about: clear
          request shapes, safe retries, useful failures, and webhook events your
          application can trust.
        </p>
        <div className="overflow-hidden rounded-xl border bg-background">
          <div className="border-b px-4 py-2 font-mono text-[11px] text-muted-foreground">
            200 OK
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-foreground/90">
            {responseSnippet}
          </pre>
        </div>
      </Reveal>

      <div className="grid gap-3 sm:grid-cols-2">
        {points.map((point, index) => (
          <Reveal
            key={point.title}
            delay={index * 75}
            className="flex items-start gap-3 rounded-xl border bg-background p-4 transition-colors hover:border-foreground/25"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 size-4 shrink-0 text-signal"
            >
              <path d="m5 12 5 5L20 7" />
            </svg>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-6">{point.title}</p>
              <p className="text-xs leading-5 text-muted-foreground">
                {point.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
