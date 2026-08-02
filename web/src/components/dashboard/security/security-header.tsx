import { ShieldCheck } from "lucide-react";

export function SecurityHeader({
    activeSessionCount,
}: {
    activeSessionCount: number;
}) {
    return (
        <div
            className="relative mb-10 overflow-hidden animate-fade-up p-6"
            style={{ animationDelay: "50ms", animationFillMode: "both" }}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 left-1/2 h-56 w-136 -translate-x-1/2 rounded-full bg-signal/10 blur-3xl dark:bg-signal/15"
            />
            <div className="relative flex flex-wrap items-end justify-between gap-6 border-b border-border/40 pb-6">
                <div className="space-y-2">
                    <p className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                        Settings &gt; Security
                    </p>
                    <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
                        Security
                        <span
                            aria-hidden="true"
                            className="ml-1 inline-block animate-caret text-primary/30"
                        >
                            _
                        </span>
                    </h1>
                    <p className="max-w-xl text-base text-muted-foreground">
                        Manage your password, two-factor authentication, and
                        active sessions.
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border/50 bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                    <ShieldCheck className="size-3.5" />
                    {activeSessionCount}{" "}
                    {activeSessionCount === 1
                        ? "active session"
                        : "active sessions"}
                </div>
            </div>
        </div>
    );
}
