import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { DeliveryAttemptPreview } from "./delivery-attempt-preview";
import { buttonVariants } from "@/components/ui/button";
import { AnimatedGrid } from "../hero/animated-grid";
import { cn } from "@/lib/utils";

export function WebhookHero() {
    return (
        <section className="relative isolate overflow-hidden py-8 lg:py-12">
            <AnimatedGrid />
            <FloatingOrbs />

            <div className="relative grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-10">
                <div className="animate-fade-up space-y-6">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                        Webhooks
                    </p>
                    <h1 className="text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                        Events for every message state change.
                    </h1>
                    <p className="max-w-lg text-pretty text-lg leading-8 text-muted-foreground">
                        Use webhooks to move delivery state from Dugble into
                        your own product: delivered OTPs, failed receipts,
                        bounced emails, and retry attempts.
                    </p>
                    <div className="flex flex-row items-center gap-3">
                        <Link
                            href="/quickstart"
                            className={cn(
                                buttonVariants({ size: "lg" }),
                                "group relative flex-1 justify-center overflow-hidden font-medium sm:flex-none",
                            )}
                        >
                            Send a test SMS
                            <ArrowRight className="ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                        <Link
                            href="/quickstart"
                            className="group/button relative inline-flex h-10 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full border bg-background px-4 font-mono text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-lg hover:shadow-black/20 sm:flex-none"
                        >
                            <span className="text-signal">$</span>
                            <span className="truncate">view docs</span>
                            <span
                                aria-hidden
                                className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                            />
                        </Link>
                    </div>
                </div>

                <div className="animate-fade-up [animation-delay:120ms]">
                    <DeliveryAttemptPreview />
                </div>
            </div>
        </section>
    );
}
