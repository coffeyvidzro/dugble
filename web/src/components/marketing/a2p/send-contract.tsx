import { CodePanel } from "./code-panel";
import { Reveal } from "../reveal";

const requestPayload = `{
  "channel": "sms",
  "to": "+233550001234",
  "template": "login_otp"
}`;

const responsePayload = `{
  "message_id": "msg_9c41af",
  "status": "queued",
  "channel": "sms",
  "created_at": "2026-07-22T09:14:02Z"
}`;

export function SendContract() {
    return (
        <section className="space-y-6">
            <Reveal className="max-w-2xl space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Send contract
                </p>
                <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    Pick the channel. Everything else stays the same.
                </h2>
                <p className="leading-7 text-muted-foreground">
                    One field{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
                        channel
                    </code>{" "}
                    decides where the message goes. The response shape, the
                    message ID, and the webhook events that follow are identical
                    either way.
                </p>
            </Reveal>
            <div className="grid gap-4 lg:grid-cols-2">
                <Reveal delay={80}>
                    <CodePanel
                        label="Request"
                        tone="muted"
                        code={requestPayload}
                    />
                </Reveal>
                <Reveal delay={160}>
                    <CodePanel
                        label="200 OK"
                        tone="signal"
                        code={responsePayload}
                    />
                </Reveal>
            </div>
        </section>
    );
}
