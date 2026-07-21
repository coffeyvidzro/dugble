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
          <h1 className="max-w-4xl font-heading text-3xl font-semibold tracking-tight md:text-4xl">
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
        <section className="rounded-[2rem] border bg-muted/40 p-6">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            What success looks like
          </h2>
          <p className="mt-3 text-muted-foreground leading-7">
            After the first test message, you should have a message ID, an
            initial queued state, a searchable log entry, and a webhook event
            path ready for delivery updates.
          </p>
        </section>
      </div>
    </main>
  );
}
