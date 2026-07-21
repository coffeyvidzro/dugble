import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-8 lg:px-8">
        <MarketingNav />
        <section className="grid gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
              Webhooks
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              Events for every message state change.
            </h1>
            <p className="text-lg text-muted-foreground leading-8">
              Use webhooks to move delivery state from Dugble into your own
              product: delivered OTPs, failed receipts, bounced emails, and
              retry attempts.
            </p>
          </div>
          <div className="rounded-[2rem] border bg-muted/40 p-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Webhook delivery contract
            </h2>
            <p className="mt-3 text-muted-foreground leading-7">
              Every event should include the event type, message ID, channel,
              recipient, timestamp, and a signature your backend can verify
              before mutating state.
            </p>
            <div className="mt-6 space-y-3 text-sm">
              {["message.delivered", "message.failed", "message.bounced"].map(
                (event) => (
                  <div
                    key={event}
                    className="rounded-2xl bg-background px-4 py-3 font-medium"
                  >
                    {event}
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
        <Separator />
        <section className="grid gap-5 md:grid-cols-3">
          <Alert>
            <AlertTitle>Verify signatures</AlertTitle>
            <AlertDescription>
              Reject events that fail the X-Dugble-Signature check before
              updating product state.
            </AlertDescription>
          </Alert>
          <Alert>
            <AlertTitle>Handle retries</AlertTitle>
            <AlertDescription>
              Return a 2xx response only after your endpoint has safely
              processed the event.
            </AlertDescription>
          </Alert>
          <Alert>
            <AlertTitle>Store event IDs</AlertTitle>
            <AlertDescription>
              Deduplicate webhook deliveries so repeated attempts do not mutate
              data twice.
            </AlertDescription>
          </Alert>
        </section>
      </div>
    </main>
  );
}
