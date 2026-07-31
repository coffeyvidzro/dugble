import Link from "next/link";

import { ArrowLeft, Clock3, ShieldCheck } from "lucide-react";

export function CreateWorkspaceHeader() {
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
                    New workspace
                </p>
                <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                    Set up a new business workspace
                </h1>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                    A separate workspace for a different business, its own API
                    keys, senders, team, and billing. You&apos;ll be the owner
                    from the start.
                </p>
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
                <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5 shrink-0" />
                    Takes about 3 minutes
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 shrink-0" />
                    Business verification usually clears in 1 business day
                </span>
            </div>
        </div>
    );
}
