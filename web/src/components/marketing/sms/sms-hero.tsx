import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import { buttonVariants } from "@/components/ui/button";
import { SmsPhonePreview } from "./sms-phone-preview";
import { AnimatedGrid } from "../hero/animated-grid";
import { TerminalLink } from "../terminal-link";
import { cn } from "@/lib/utils";

export function SmsHero() {
    return (
        <section className="relative isolate overflow-hidden py-8 lg:py-12 rounded-2xl">
            <AnimatedGrid />
            <FloatingOrbs />

            <div className="relative grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-8 px-6">
                <div className="animate-fade-up space-y-6">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                        SMS API
                    </p>
                    <h1 className="text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                        SMS built for the moment a code has to arrive.
                    </h1>
                    <p className="max-w-lg text-pretty text-lg leading-8 text-muted-foreground">
                        Send A2P SMS with stable message IDs, idempotency keys,
                        real delivery states, and webhook events your backend
                        can actually trust.
                    </p>
                    <div className="flex flex-row items-center gap-3">
                        <Link
                            href="/quickstart"
                            className={cn(
                                buttonVariants({ size: "lg" }),
                                "group relative overflow-hidden font-medium",
                            )}
                        >
                            Send a test SMS
                            <ArrowRight className="ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                        <TerminalLink href="/docs/sms">view docs</TerminalLink>
                    </div>
                </div>

                <div className="animate-fade-up [animation-delay:120ms]">
                    <SmsPhonePreview />
                </div>
            </div>
        </section>
    );
}
