import { CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const points = [
  {
    title: "Recipients are masked by default",
    detail:
      "The dashboard shows +233 55 •••• 12, not the full number. Full values are only ever visible where a workspace member explicitly needs them.",
  },
  {
    title: "Metadata, not message content, is what's retained",
    detail:
      "Delivery tracking relies on status, timestamps, and provider responses, not storing the message body long-term.",
  },
  {
    title: "Logs never cross workspace boundaries",
    detail:
      "A workspace's logs are only ever visible to members of that workspace, with no cross-tenant view, ever.",
  },
];

export function DataHandling() {
  return (
    <Reveal
      as="section"
      className="grid gap-8 rounded-2xl border bg-card/60 p-6 md:p-8 lg:grid-cols-[0.7fr_1fr] lg:gap-10"
    >
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Data handling
        </p>
        <h2 className="text-balance font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          What we actually keep.
        </h2>
        <p className="leading-7 text-muted-foreground">
          Recognizable from the dashboard preview elsewhere on this site. The
          masking you've seen isn't cosmetic, it's the default.
        </p>
      </div>
      <div className="space-y-4">
        {points.map((point) => (
          <div key={point.title} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-signal" />
            <div>
              <p className="text-sm font-medium">{point.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {point.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
