import {
  Building2,
  Info,
  KeyRound,
  Radio,
  Search,
  Smartphone,
} from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";
import { CodeTabs } from "./code-tabs";
import { StepRail } from "./step-rail";

const steps = [
  {
    number: "01",
    title: "Create a workspace",
    icon: Building2,
    description:
      "Keep API keys, senders, logs, and webhooks grouped by product or environment.",
  },
  {
    number: "02",
    title: "Generate an API key",
    icon: KeyRound,
    description:
      "Use server-side keys for authenticated email and SMS requests.",
    code: `DUGBLE_API_KEY=sk_live_51ac9f2e...
DUGBLE_ENV=production`,
  },
  {
    number: "03",
    title: "Send a test SMS",
    icon: Smartphone,
    description:
      "Start with an OTP payload and confirm you receive a message_id back.",
    requestTabs: [
      {
        label: "cURL",
        code: `curl https://api.dugble.com/v1/messages \\
  -H "Authorization: Bearer $DUGBLE_API_KEY" \\
  -d channel="sms" -d to="+233531184325" \\
  -d template="login_otp"`,
      },
      {
        label: "Node (fetch)",
        code: `await fetch("https://api.dugble.com/v1/messages", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.DUGBLE_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    channel: "sms",
    to: "+233531184325",
    template: "login_otp",
  }),
});`,
      },
      {
        label: "Python (requests)",
        code: `import os, requests

requests.post(
    "https://api.dugble.com/v1/messages",
    headers={"Authorization": f"Bearer {os.environ['DUGBLE_API_KEY']}"},
    json={
        "channel": "sms",
        "to": "+233531184325",
        "template": "login_otp",
    },
)`,
      },
    ],
    response: `{
  "message_id": "msg_9c41af",
  "status": "queued",
  "channel": "sms",
  "created_at": "2026-07-22T09:14:02Z"
}`,
    tip: "Add an idempotency_key to this request. Retrying a failed network call then won't send a second OTP.",
  },
  {
    number: "04",
    title: "Add a webhook",
    icon: Radio,
    description:
      "Point Dugble at an endpoint that can receive message.delivered and message.failed.",
    code: `POST /webhooks/dugble
X-Dugble-Event: message.delivered
X-Dugble-Signature: t=1721642042,v1=5f3d8c9e...`,
    response: `HTTP/1.1 200 OK`,
    responseLabel: "Your endpoint should return",
    tip: "Return a 2xx within a few seconds. Anything slower or a non-2xx queues a retry.",
  },
  {
    number: "05",
    title: "Check logs",
    icon: Search,
    description:
      "Search by message_id or recipient to confirm status, provider response, and webhook attempts.",
    code: `dugble logs --message-id msg_9c41af
> queued → sent → delivered (812ms)`,
    tip: "The same trace is one click away in the dashboard's log table, not just the CLI.",
  },
];

export const stepMeta = steps.map(({ number, title }) => ({
  number,
  title,
}));

export function QuickstartSteps() {
  return (
    <section className="grid min-w-0 gap-8 md:grid-cols-[170px_1fr] md:gap-12">
      <StepRail steps={stepMeta} />

      <div className="min-w-0">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;

          return (
            <div
              key={step.number}
              id={`step-${step.number}`}
              className={cn(
                "relative scroll-mt-28",
                !isLast && "pb-14 md:pb-20",
              )}
            >
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-6 top-12 hidden h-[calc(100%-1.5rem)] w-px bg-border md:block"
                />
              )}

              <Reveal
                delay={i * 90}
                className="relative grid min-w-0 gap-6 md:grid-cols-[3rem_1fr] md:gap-8"
              >
                <div className="relative z-10 flex size-12 items-center justify-center rounded-full border bg-card text-signal">
                  <step.icon className="size-5" />
                </div>
                <div className="min-w-0 space-y-4">
                  <div className="space-y-2">
                    <p className="font-mono text-xs text-muted-foreground">
                      Step {step.number}
                    </p>
                    <h2 className="font-heading text-2xl font-semibold tracking-tight">
                      {step.title}
                    </h2>
                    <p className="max-w-xl leading-7 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  {step.requestTabs && <CodeTabs snippets={step.requestTabs} />}

                  {step.code && !step.requestTabs && (
                    <pre className="overflow-x-auto rounded-xl border bg-card p-4 font-mono text-[13px] leading-6 text-foreground/90">
                      {step.code}
                    </pre>
                  )}

                  {step.response && (
                    <div className="overflow-hidden rounded-xl border bg-card">
                      <div className="flex items-center justify-between border-b px-4 py-2 font-mono text-[11px] text-signal">
                        <span>{step.responseLabel ?? "200 OK"}</span>
                        <span className="size-1.5 rounded-full bg-signal" />
                      </div>
                      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-foreground/90">
                        {step.response}
                      </pre>
                    </div>
                  )}

                  {step.tip && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-pending/30 bg-pending/5 px-4 py-3">
                      <Info className="mt-0.5 size-4 shrink-0 text-pending" />
                      <p className="text-sm leading-6 text-muted-foreground">
                        {step.tip}
                      </p>
                    </div>
                  )}
                </div>
              </Reveal>
            </div>
          );
        })}
      </div>
    </section>
  );
}
