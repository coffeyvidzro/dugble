import { Reveal } from "@/components/marketing/reveal";

const payload = `POST /webhooks/dugble HTTP/1.1
Host: your-api.com
Content-Type: application/json
X-Dugble-Event: message.delivered
X-Dugble-Signature: t=1721642042,v1=5f3d8c9e2a1b...

{
  "event": "message.delivered",
  "message_id": "msg_9c41af",
  "channel": "sms",
  "to": " +233531184325",
  "occurred_at": "2026-07-22T09:14:04Z"
}`;

export function WebhookContract() {
  return (
    <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <Reveal className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Delivery contract
        </p>
        <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Every event is signed and self-contained.
        </h2>
        <p className="leading-7 text-muted-foreground">
          Each event carries the type, message ID, channel, recipient, and a
          timestamp plus a signature your backend verifies before it ever
          mutates state. Return a 2xx only once you've safely processed it.
        </p>
      </Reveal>

      <Reveal
        delay={150}
        className="overflow-hidden rounded-2xl border bg-card"
      >
        <div className="flex items-center justify-between border-b px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
          <span>Webhook request</span>
          <span className="text-signal">signed</span>
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-foreground/90">
          {payload}
        </pre>
      </Reveal>
    </section>
  );
}
