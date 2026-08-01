import { Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AnimatedGrid } from "@/components/marketing/hero/animated-grid";
import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { Reveal } from "@/components/marketing/reveal";
import { DataHandling } from "@/components/marketing/security/data-handling";
import { SecurityControls } from "@/components/marketing/security/security-controls";
import { SecurityLifecycle } from "@/components/marketing/security/security-lifecycle";
import { SecurityRoadmap } from "@/components/marketing/security/security-roadmap";
import { Separator } from "@/components/ui/separator";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Security Infrastructure",
  description:
    "Learn how Dugble protects A2P messaging workflows with server-side keys, signed webhooks, CSRF tokens, and session checks.",
  path: "/security",
});

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-8 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-2xl px-6 py-12">
          <AnimatedGrid />
          <FloatingOrbs />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8">
            <Reveal className="space-y-6">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                Security
              </p>
              <h1 className="max-w-xl text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                Security for message-sending infrastructure.
              </h1>
              <p className="max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
                Dugble protects the surfaces that matter for A2P workflows:
                keys, sessions, webhooks, workspace access, and message logs.
              </p>
            </Reveal>

            <Reveal
              delay={120}
              className="overflow-hidden rounded-2xl border bg-card"
            >
              <div className="flex items-center justify-between border-b px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                <span>Incoming webhook</span>
                <span className="text-signal">verified</span>
              </div>
              <div className="space-y-3 p-4 font-mono text-[13px] leading-6">
                <p className="text-foreground/80">X-Dugble-Signature:</p>
                <p className="truncate text-muted-foreground">
                  t=1721642042,v1=5f3d8c9e2a1b...
                </p>
                <div className="flex items-center gap-2 border-t pt-3 text-signal">
                  <ShieldCheck className="size-4" />
                  <span>Signature matches — safe to process</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Separator />

        <SecurityLifecycle />
        <SecurityControls />
        <DataHandling />
        <SecurityRoadmap />

        <Reveal
          as="section"
          className="flex flex-col items-start justify-between gap-6 rounded-2xl border bg-card p-6 md:flex-row md:items-center md:p-8"
        >
          <div className="max-w-xl space-y-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Found something?
            </h2>
            <p className="leading-7 text-muted-foreground">
              If you believe you've found a security issue in Dugble, we'd
              rather hear it from you first.
            </p>
          </div>
          <Link
            href="mailto:security@dugble.com"
            className="group/button relative inline-flex h-11 shrink-0 items-center gap-2 overflow-hidden rounded-full border bg-background px-4 font-mono text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
          >
            <Mail className="size-4 text-signal" />
            security@dugble.com
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
            />
          </Link>
        </Reveal>
      </div>
    </main>
  );
}
