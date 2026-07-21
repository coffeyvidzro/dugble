import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Separator } from "@/components/ui/separator";

const steps = [
  [
    "1",
    "Create a workspace",
    "Keep API keys, senders, logs, and webhooks grouped by product or environment.",
  ],
  [
    "2",
    "Generate an API key",
    "Use server-side keys for authenticated email and SMS requests.",
  ],
  [
    "3",
    "Send a test SMS",
    "Start with OTP or alert payloads and confirm you receive a message_id.",
  ],
  [
    "4",
    "Add a webhook",
    "Point Dugble at an endpoint that can receive message.delivered and message.failed.",
  ],
  [
    "5",
    "Check logs",
    "Search by message_id or recipient to confirm status, provider response, and webhook attempts.",
  ],
];

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-8 lg:px-8">
        <MarketingNav />
        <section className="space-y-6 py-12">
          <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
            Quickstart
          </p>
          <h1 className="max-w-4xl font-heading text-5xl font-semibold tracking-tight md:text-6xl">
            From API key to traceable message.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground leading-8">
            The first Dugble integration should prove three things: your request
            is accepted, your message can be traced, and your backend receives
            delivery events.
          </p>
        </section>
        <Separator />
        <section className="space-y-8">
          {steps.map(([number, title, description]) => (
            <div
              key={number}
              className="grid gap-4 border-b pb-8 md:grid-cols-[80px_1fr]"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                {number}
              </div>
              <div>
                <h2 className="font-heading text-2xl font-semibold">{title}</h2>
                <p className="mt-2 text-muted-foreground leading-7">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </section>
        <pre className="overflow-x-auto rounded-[2rem] border bg-muted/50 p-6 text-sm leading-7">
          <code>{`curl https://api.dugble.com/v1/messages/sms \
  -H "Authorization: Bearer dug_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"to":"+233501234567","body":"Your code is 123456"}'`}</code>
        </pre>
      </div>
    </main>
  );
}
