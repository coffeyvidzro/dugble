import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const events = [
  "message.queued",
  "message.sent",
  "message.delivered",
  "message.bounced",
  "message.failed",
];

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-8 lg:px-8">
        <MarketingNav />
        <section className="grid gap-10 py-12 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
              Email API
            </p>
            <h1 className="font-heading text-5xl font-semibold tracking-tight md:text-6xl">
              Transactional email without the black box.
            </h1>
            <p className="text-lg text-muted-foreground leading-8">
              Send receipts, password resets, alerts, and lifecycle email with
              message IDs, template data, delivery events, and logs built into
              the workflow.
            </p>
            <Button size="lg" render={<a href="/quickstart" />}>
              Send a test email
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-[2rem] border bg-muted/50 p-6 text-sm leading-7">
            <code>{`POST /v1/messages/email

{
  "to": "customer@example.com",
  "template": "receipt",
  "data": {
    "order_id": "DGB-1001",
    "total": "GHS 250.00"
  }
}`}</code>
          </pre>
        </section>
        <Separator />
        <section className="grid gap-8 md:grid-cols-3">
          <div>
            <h2 className="font-heading text-2xl font-semibold">
              Template data
            </h2>
            <p className="mt-3 text-muted-foreground leading-7">
              Pass structured JSON into reusable transactional templates without
              mixing product logic into email copy.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold">
              Bounces and failures
            </h2>
            <p className="mt-3 text-muted-foreground leading-7">
              Expose bounced, failed, and provider-response states so teams can
              support customers quickly.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold">
              Message logs
            </h2>
            <p className="mt-3 text-muted-foreground leading-7">
              Search by message_id, recipient, template, or request ID when
              something goes wrong.
            </p>
          </div>
        </section>
        <section className="rounded-[2rem] bg-card p-6">
          <p className="mb-4 font-medium">Email events</p>
          <div className="flex flex-wrap gap-2">
            {events.map((event) => (
              <code
                key={event}
                className="rounded-full bg-muted px-3 py-1 text-sm"
              >
                {event}
              </code>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
