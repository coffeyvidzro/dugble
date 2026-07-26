import { Mail } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

export function BrandContact() {
  return (
    <Reveal
      as="section"
      className="flex flex-col items-start justify-between gap-6 rounded-2xl border bg-card p-6 md:flex-row md:items-center md:p-8"
    >
      <div className="max-w-xl space-y-2">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Using the Dugble name somewhere?
        </h2>
        <p className="leading-7 text-muted-foreground">
          Integrations, press mentions, and partner pages are welcome. Just keep
          the marks unaltered. For anything not covered here, ask first.
        </p>
      </div>
      <a
        href="mailto:brand@dugble.com"
        className="group/button relative inline-flex h-11 shrink-0 items-center gap-2 overflow-hidden rounded-full border bg-background px-4 font-mono text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-lg hover:shadow-black/20"
      >
        <Mail className="size-4 text-signal" />
        brand@dugble.com
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
        />
      </a>
    </Reveal>
  );
}
