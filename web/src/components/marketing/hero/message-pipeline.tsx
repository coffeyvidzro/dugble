import { Reveal } from "@/components/marketing/reveal";

const stages = [
  {
    n: "01",
    name: "Request",
    detail: "Your server calls the API with a channel and a template.",
    tone: "text-foreground",
  },
  {
    n: "02",
    name: "Queued",
    detail: "Dugble accepts the message and returns a message_id.",
    tone: "text-pending",
  },
  {
    n: "03",
    name: "Sent",
    detail: "Handed off to the carrier or mailbox provider.",
    tone: "text-foreground",
  },
  {
    n: "04",
    name: "Delivered or failed",
    detail: "Final state is confirmed and a webhook fires immediately.",
    tone: "text-signal",
  },
];

export function MessagePipeline() {
  return (
    <section className="space-y-10">
      <Reveal className="max-w-2xl space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          How a message moves
        </p>
        <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          One request, four states, no guessing in between.
        </h2>
      </Reveal>

      <ol className="relative grid gap-6 md:grid-cols-4 md:gap-4">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-6 hidden bg-border md:block"
        />
        {stages.map((stage, index) => (
          <Reveal
            key={stage.n}
            as="li"
            delay={index * 100}
            className="relative space-y-3 rounded-xl border bg-card/60 p-5 transition-colors hover:border-foreground/25"
          >
            <span className="font-mono text-xs text-muted-foreground">
              {stage.n}
            </span>
            <h3 className={`font-heading text-lg font-semibold ${stage.tone}`}>
              {stage.name}
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              {stage.detail}
            </p>
          </Reveal>
        ))}
      </ol>

      <Reveal
        delay={200}
        className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border bg-muted/30 px-5 py-4 font-mono text-xs text-muted-foreground"
      >
        <span className="text-foreground">Webhook events:</span>
        <span>message.queued</span>
        <span>message.sent</span>
        <span className="text-signal">message.delivered</span>
        <span className="text-danger">message.failed</span>
      </Reveal>
    </section>
  );
}
