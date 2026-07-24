import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

export function Cta() {
    return (
        <Reveal
            as="section"
            className="relative overflow-hidden rounded-2xl border bg-card p-8 md:p-12"
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.4]"
                style={{
                    backgroundImage:
                        "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
                    backgroundSize: "38px 38px",
                    maskImage:
                        "radial-gradient(ellipse 60% 100% at 80% 50%, black 0%, transparent 70%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 60% 100% at 80% 50%, black 0%, transparent 70%)",
                }}
            />
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div className="max-w-xl space-y-3">
                    <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight">
                        Send your first message in the next five minutes.
                    </h2>
                    <p className="leading-7 text-muted-foreground">
                        Create a workspace, generate an API key, and watch the
                        delivery event come back in the dashboard.
                    </p>
                </div>
                <Link
                    href="/sign-up"
                    className={cn(buttonVariants({ size: "lg" }), "shrink-0")}
                >
                    Start building
                </Link>
            </div>
        </Reveal>
    );
}
