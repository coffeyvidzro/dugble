import Link from "next/link";

import { ArrowLeft, Clock3 } from "lucide-react";

export function CreateTeamHeader() {
  return (
    <div className="relative space-y-5 sm:space-y-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 -z-10 h-40 overflow-hidden sm:h-48 mask-[radial-gradient(ellipse_55%_100%_at_top_left,black,transparent_70%)]"
      >
        <div
          className="animate-grid-pan absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      <Link
        href="/dashboard"
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to dashboard
      </Link>

      <div className="space-y-2.5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
          New team
        </p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Create a new team
        </h1>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          A team keeps its own API keys, senders, webhooks, and members apart
          from your other work. You&apos;ll be the owner from the start.
        </p>
      </div>

      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
        <Clock3 className="size-3.5 shrink-0" />
        Takes about a minute
      </span>
    </div>
  );
}
