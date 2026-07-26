import { Mail, Smartphone } from "lucide-react";
import { Reveal } from "../reveal";

const capabilities = [
  {
    label: "Best for",
    sms: "OTPs, urgent alerts, time-sensitive codes",
    email: "Receipts, lifecycle email, longer content",
  },
  {
    label: "Addressing",
    sms: "Phone number, E.164 format",
    email: "Email address",
  },
  {
    label: "Delivery events",
    sms: "queued · sent · delivered · failed · expired",
    email: "queued · sent · delivered · bounced · failed",
  },
  {
    label: "Retry behavior",
    sms: "Carrier-dependent, provider-managed",
    email: "Automatic retry on transient mailbox errors",
  },
];

export function ChannelComparison() {
  return (
    <section className="space-y-6">
      <Reveal className="max-w-2xl space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Channel differences
        </p>
        <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Same API, different physics.
        </h2>
        <p className="leading-7 text-muted-foreground">
          SMS and email aren&apos;t interchangeable. A unified API
          shouldn&apos;t pretend otherwise. Here&apos;s what actually differs
          underneath.
        </p>
      </Reveal>

      <Reveal delay={80} className="overflow-hidden rounded-2xl border">
        <div className="grid grid-cols-3 border-b bg-muted/30 font-mono text-xs text-muted-foreground">
          <div className="p-4" />
          <div className="flex items-center gap-2 p-4">
            <Smartphone className="size-3.5" />
            SMS
          </div>
          <div className="flex items-center gap-2 p-4">
            <Mail className="size-3.5" />
            Email
          </div>
        </div>
        {capabilities.map((row) => (
          <div
            key={row.label}
            className="group grid grid-cols-3 border-b transition-colors duration-200 last:border-0 hover:bg-muted/20"
          >
            <div className="p-4 text-sm font-medium">{row.label}</div>
            <div className="p-4 text-sm leading-6 text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
              {row.sms}
            </div>
            <div className="p-4 text-sm leading-6 text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
              {row.email}
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
