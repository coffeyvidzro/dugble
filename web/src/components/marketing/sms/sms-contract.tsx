import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

const request = `{
  "to": "+233531184325",
  "template": "login_otp",
  "idempotency_key": "otp_7f2a9c"
}`;

const response = `{
  "message_id": "msg_9c41af",
  "status": "queued",
  "channel": "sms",
  "created_at": "2026-07-22T09:14:02Z"
}`;

export function SmsContract() {
    return (
        <section className="space-y-6">
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Send contract
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    One request in, one traceable state back.
                </h2>
                <p className="leading-7 text-muted-foreground">
                    Include the recipient, template, and an idempotency key. A
                    successful response returns a message ID and its first
                    delivery state, never a silent 200 with nothing to trace.
                </p>
            </Reveal>

            <div className="grid gap-4 lg:grid-cols-2">
                <Reveal delay={100}>
                    <CodePanel label="Request" tone="muted" code={request} />
                </Reveal>
                <Reveal delay={200}>
                    <CodePanel label="200 OK" tone="signal" code={response} />
                </Reveal>
            </div>
        </section>
    );
}

function CodePanel({
    label,
    tone,
    code,
}: {
    label: string;
    tone: "muted" | "signal";
    code: string;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border bg-card">
            <div
                className={cn(
                    "flex items-center justify-between border-b px-4 py-2.5 font-mono text-[11px]",
                    tone === "signal" ? "text-signal" : "text-muted-foreground",
                )}
            >
                <span>{label}</span>
                {tone === "signal" && (
                    <span className="size-1.5 rounded-full bg-signal" />
                )}
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-foreground/90">
                {code}
            </pre>
        </div>
    );
}
