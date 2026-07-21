import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Button } from "@/components/ui/button";

const productPillars = [
  {
    title: "Email API",
    description:
      "Send transactional email for receipts, alerts, onboarding, and lifecycle messaging with clear delivery events.",
  },
  {
    title: "SMS API",
    description:
      "Deliver OTPs, login codes, reminders, and customer notifications through developer-friendly A2P SMS workflows.",
  },
  {
    title: "Webhooks",
    description:
      "Receive delivery, failure, retry, and engagement events so your product can react to every message state.",
  },
  {
    title: "Message logs",
    description:
      "Trace requests, inspect provider responses, and debug failed customer notifications without guesswork.",
  },
];

const developerExperience = [
  "Predictable REST APIs",
  "Useful errors and request IDs",
  "Webhook retries and signatures",
  "Test-mode friendly workflows",
  "Idempotency for safe retries",
  "Clear dashboard observability",
];

const a2pUseCases = [
  "OTP and verification codes",
  "Receipts and invoices",
  "Delivery and logistics updates",
  "Account and security alerts",
  "Customer lifecycle notifications",
  "Payment and transaction messages",
];

export default function Home() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-6 py-8 lg:px-8">
        <MarketingNav />

        <section className="grid min-h-[70svh] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
                Developer-first A2P messaging
              </p>
              <h1 className="max-w-5xl font-heading text-5xl font-semibold tracking-tight md:text-7xl">
                Email and SMS APIs for products that need messages delivered.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground leading-8">
                Dugble helps teams send OTPs, alerts, receipts, and customer
                notifications with clean APIs, useful logs, and webhook-driven
                delivery workflows.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<a href="/sign-up" />}>
                Start building
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<a href="/quickstart" />}
              >
                View quickstart
              </Button>
            </div>
            <div className="grid gap-3 text-muted-foreground text-sm sm:grid-cols-3">
              <p>Built for A2P traffic</p>
              <p>Designed for developer experience</p>
              <p>Email, SMS, logs, and webhooks</p>
            </div>
          </div>

          <div className="rounded-[2rem] border bg-muted/40 p-6">
            <div className="mb-5 space-y-1">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                Send an OTP in one request
              </h2>
              <p className="text-muted-foreground text-sm">
                A simple API surface for high-trust customer communication.
              </p>
            </div>
            <pre className="overflow-x-auto text-sm leading-7">
              <code>{`curl https://api.dugble.com/v1/messages/sms \
  -H "Authorization: Bearer dug_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+233501234567",
    "template": "otp",
    "data": { "code": "123456" },
    "idempotency_key": "otp_01J..."
  }'`}</code>
            </pre>
          </div>
        </section>

        <section className="space-y-8">
          <div className="max-w-2xl space-y-3">
            <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
              Product surface
            </p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-5xl">
              The messaging primitives your product team needs.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {productPillars.map((pillar) => (
              <div key={pillar.title} className="rounded-[2rem] border p-5">
                <h3 className="font-heading text-xl font-semibold tracking-tight">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-muted-foreground text-sm leading-6">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 rounded-[2rem] border bg-card p-6 md:p-8 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
              Developer experience
            </p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-5xl">
              Integration should feel predictable from the first API call.
            </h2>
            <p className="text-muted-foreground leading-8">
              Dugble is being built around the details developers care about:
              clear request shapes, safe retries, useful failures, logs that
              explain what happened, and webhook events that your application
              can trust.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {developerExperience.map((item) => (
              <div key={item} className="rounded-2xl border bg-background p-4">
                <p className="font-medium">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.8fr_1fr]">
          <div className="space-y-4">
            <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
              A2P use cases
            </p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-5xl">
              Customer messages for critical product moments.
            </h2>
            <p className="text-muted-foreground leading-8">
              Start with the high-trust transactional flows your users already
              depend on, then grow into broader customer notifications.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {a2pUseCases.map((item) => (
              <div key={item} className="rounded-2xl border p-4">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-primary p-8 text-primary-foreground md:p-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl space-y-3">
              <h2 className="font-heading text-3xl font-semibold tracking-tight">
                Build your first messaging workflow with Dugble.
              </h2>
              <p className="text-primary-foreground/80">
                Create a workspace, generate an API key, send a test message,
                and inspect delivery events from one dashboard.
              </p>
            </div>
            <Button
              size="lg"
              variant="secondary"
              render={<a href="/sign-up" />}
            >
              Start building
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
