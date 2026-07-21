import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const statuses = ["queued", "sent", "delivered", "failed", "expired"];
const details = [
  [
    "Stable IDs",
    "Every accepted request returns a message_id your team can search, store, and trace.",
  ],
  [
    "Idempotent sends",
    "Use idempotency_key for retries so network failures do not create duplicate OTPs.",
  ],
  [
    "Failure reasons",
    "Expose provider responses and normalized errors so support is not guessing.",
  ],
  [
    "Webhook events",
    "Handle message.sent, message.delivered, and message.failed in your backend.",
  ],
];

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-8 lg:px-8">
        <MarketingNav />
        <section className="grid gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
              SMS API
            </p>
            <h1 className="font-heading text-5xl font-semibold tracking-tight md:text-6xl">
              SMS API for OTPs and product alerts.
            </h1>
            <p className="text-lg text-muted-foreground leading-8">
              Send A2P SMS with stable message IDs, idempotency keys, delivery
              states, and webhook events your backend can trust.
            </p>
            <Button size="lg" render={<a href="/quickstart" />}>
              Send a test SMS
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-[2rem] border bg-muted/50 p-6 text-sm leading-7">
            <code>{`POST /v1/messages/sms
Authorization: Bearer dug_live_xxx
Idempotency-Key: otp_01J...

{
  "to": "+233501234567",
  "template": "otp",
  "data": { "code": "123456" }
}

202 Accepted
{
  "message_id": "msg_01J...",
  "status": "queued"
}`}</code>
          </pre>
        </section>
        <Separator />
        <section className="grid gap-8 lg:grid-cols-[0.65fr_1fr]">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              Trace the whole lifecycle.
            </h2>
            <p className="mt-3 text-muted-foreground leading-7">
              When a user says they did not get the code, you should know where
              it stopped.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {details.map(([title, description]) => (
              <div key={title} className="rounded-3xl border p-5">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-muted-foreground text-sm leading-6">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-[2rem] bg-card p-6">
          <p className="mb-4 font-medium">Expected SMS states</p>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <code
                key={status}
                className="rounded-full bg-muted px-3 py-1 text-sm"
              >
                {status}
              </code>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
