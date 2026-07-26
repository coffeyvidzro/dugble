import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/marketing/reveal";

const requestExample = `GET /v1/messages/msg_9c41af HTTP/1.1
Host: api.dugble.com
Authorization: Bearer tk_team_8f2ac1
X-Dugble-Workspace: wsp_4b71ea`;

export function UnderTheHood() {
  return (
    <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
      <Reveal className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Under the hood
        </p>
        <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Tokens scoped to a team, not a person.
        </h2>
        <p className="leading-7 text-muted-foreground">
          Every request carries a token scoped to a specific team and workspace,
          not a shared account key. Security middleware checks the session and
          signature before a request ever reaches messaging logic.
        </p>
        <Link
          href="/security"
          className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-signal transition-colors group-hover:text-signal"
        >
          Read the full security model
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </Reveal>

      <Reveal
        delay={100}
        className="overflow-hidden rounded-2xl border bg-card"
      >
        <div className="flex items-center justify-between border-b px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
          <span>Scoped request</span>
          <span className="text-signal">workspace-isolated</span>
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-foreground/90">
          {requestExample}
        </pre>
      </Reveal>
    </section>
  );
}
