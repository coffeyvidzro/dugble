import { ArrowRight } from "lucide-react";
import { AnimatedGrid } from "@/components/marketing/hero/animated-grid";
import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { SearchTrigger } from "@/components/command-palette/search-trigger";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const quickLinks = [
    { label: "Quickstart", href: "/quickstart" },
    { label: "A2P API", href: "/features/a2p-api" },
    { label: "Changelog", href: "/changelog" },
    { label: "Contact", href: "/contact" },
];

export default function NotFound() {
    return (
        <main className="relative isolate flex min-h-svh w-full items-center justify-center overflow-hidden px-6 py-12">
            <AnimatedGrid />
            <FloatingOrbs />

            <div className="relative flex w-full max-w-lg animate-fade-up flex-col items-center text-center">
                <span className="font-mono mb-6 text-6xl font-semibold tracking-tight text-foreground/10 md:text-7xl">
                    404
                </span>

                <div className="-mt-6 w-full overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-black/40">
                    <div className="flex items-center gap-1.5 border-b bg-muted/30 px-4 py-3">
                        <span className="size-2.5 rounded-full bg-danger/70" />
                        <span className="size-2.5 rounded-full bg-pending/70" />
                        <span className="size-2.5 rounded-full bg-signal/70" />
                        <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                            dugble - route.log
                        </span>
                    </div>
                    <div className="space-y-3 p-5 text-left font-mono text-[13px] leading-6">
                        <p className="text-foreground/90">
                            <span className="text-signal">$ </span>
                            GET {"{this page}"}
                        </p>
                        <div className="flex items-center justify-between border-t pt-3">
                            <span className="text-muted-foreground">
                                route_not_found
                            </span>
                            <span className="rounded-full bg-danger/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-danger">
                                404
                            </span>
                        </div>
                    </div>
                </div>

                <h1 className="mt-8 text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                    This page didn't deliver.
                </h1>
                <p className="mt-3 max-w-sm text-pretty leading-7 text-muted-foreground">
                    No retry is going to fix this one. The route just doesn't
                    exist. Might've moved, or never shipped.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <a
                        href="/"
                        className={cn(buttonVariants({ size: "lg" }), "group")}
                    >
                        Return home
                        <ArrowRight className="ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </a>
                    <SearchTrigger />
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t pt-6 font-mono text-xs text-muted-foreground">
                    {quickLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="transition-colors hover:text-foreground"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            </div>
        </main>
    );
}
