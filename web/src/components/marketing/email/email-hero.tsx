import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { buttonVariants } from "@/components/ui/button";
import { AnimatedGrid } from "../hero/animated-grid";
import { TerminalLink } from "../terminal-link";
import { InboxPreview } from "./inbox-preview";
import { cn } from "@/lib/utils";

export function EmailHero() {
    return (
        <section className="relative isolate overflow-hidden py-8 lg:py-12">
            <AnimatedGrid />
            <FloatingOrbs />

            <div className="relative grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-10">
                <div className="animate-fade-up space-y-6">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                        Email API
                    </p>
                    <h1 className="text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                        Transactional email without the black box.
                    </h1>
                    <p className="max-w-lg text-pretty text-lg leading-8 text-muted-foreground">
                        Send receipts, password resets, alerts, and lifecycle
                        email with message IDs, template data, delivery events,
                        and logs built into the workflow.
                    </p>
                    <div className="flex flex-row items-center gap-3">
                        <Link
                            href="/quickstart"
                            className={cn(
                                buttonVariants({ size: "lg" }),
                                "group relative flex-1 justify-center overflow-hidden font-medium sm:flex-none",
                            )}
                        >
                            Send a test email
                            <ArrowRight className="ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                        <TerminalLink
                            href="/quickstart"
                            className="flex-1 sm:flex-none"
                        >
                            view docs
                        </TerminalLink>
                    </div>
                </div>

                <div className="animate-fade-up [animation-delay:120ms]">
                    <InboxPreview />
                </div>
            </div>
        </section>
    );
}
