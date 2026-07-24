import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { AnimatedGrid } from "@/components/marketing/hero/animated-grid";
import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { buttonVariants } from "@/components/ui/button";
import { RouteDiagram } from "./route-diagram";
import { cn } from "@/lib/utils";

export function A2pHero() {
    return (
        <section className="relative isolate overflow-hidden py-12">
            <AnimatedGrid />
            <FloatingOrbs />
            <div className="relative grid gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-10">
                <div className="animate-fade-up space-y-6">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                        A2P API
                    </p>
                    <h1 className="max-w-xl text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                        One API. Every channel your product actually needs.
                    </h1>
                    <p className="max-w-lg text-pretty text-lg leading-8 text-muted-foreground">
                        Send OTPs over SMS, receipts over email, and everything
                        in between through a single endpoint with the same
                        message ID, delivery states, and webhook events no
                        matter which channel carries it.
                    </p>
                    <div className="flex flex-row items-center gap-3">
                        <Link
                            href="/sign-up"
                            className={cn(
                                buttonVariants({ size: "lg" }),
                                "group relative flex-1 justify-center overflow-hidden font-medium sm:flex-none",
                            )}
                        >
                            Start building
                            <ArrowRight className="ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                        <Link
                            href="/quickstart"
                            className="group/button relative inline-flex h-10 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full border bg-background px-4 font-mono text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-lg hover:shadow-black/20 sm:flex-none"
                        >
                            <span className="text-signal">$</span>
                            view docs
                            <span
                                aria-hidden
                                className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                            />
                        </Link>
                    </div>
                </div>

                <div className="animate-fade-up rounded-2xl border bg-card p-6 shadow-2xl shadow-black/40 [animation-delay:120ms]">
                    <div className="flex items-center justify-between border-b pb-3 font-mono text-[11px] text-muted-foreground">
                        <span>POST /v1/messages</span>
                        <span className="text-signal">
                            channel: sms | email
                        </span>
                    </div>

                    <RouteDiagram />
                </div>
            </div>
        </section>
    );
}
