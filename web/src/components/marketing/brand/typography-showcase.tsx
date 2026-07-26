import { Reveal } from "@/components/marketing/reveal";

const specimens = [
  {
    label: "Display - Space Grotesk",
    usage: "Headlines and section titles only. Semibold, tight tracking.",
    sample: "Aa Bb Cc 0123",
    className: "font-heading text-4xl font-semibold tracking-tight",
  },
  {
    label: "Body - Inter",
    usage: "Paragraph copy and UI labels. Regular and medium weights.",
    sample: "Aa Bb Cc 0123",
    className: "font-sans text-2xl",
  },
  {
    label: "Mono - JetBrains Mono",
    usage: "Logs, request IDs, code, status labels, numerals.",
    sample: "Aa Bb Cc 0123",
    className: "font-mono text-2xl",
  },
];

export function TypographyShowcase() {
  return (
    <section className="space-y-8">
      <Reveal className="max-w-2xl space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Type
        </p>
        <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Three faces, each with one job.
        </h2>
        <p className="leading-7 text-muted-foreground">
          Mono isn't an accent font here. It's load-bearing. Anything that's
          data (an ID, a status, a number) reads better in mono than dressed up
          in the display face.
        </p>
      </Reveal>

      <div className="divide-y rounded-2xl border">
        {specimens.map((spec, i) => (
          <Reveal
            key={spec.label}
            delay={i * 80}
            className="grid gap-4 p-6 md:grid-cols-[1fr_1fr] md:items-center md:p-8"
          >
            <div>
              <p className="font-mono text-xs text-muted-foreground">
                {spec.label}
              </p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {spec.usage}
              </p>
            </div>
            <p className={spec.className}>{spec.sample}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
