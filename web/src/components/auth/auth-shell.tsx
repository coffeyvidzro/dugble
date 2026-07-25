"use client";

import type * as React from "react";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedGrid } from "@/components/marketing/hero/animated-grid";
import { FloatingOrbs } from "@/components/marketing/hero/floating-orbs";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface AuthShellProps {
    title: string;
    subtitle: string;
    backHref: string;
    backLabel: string;
    footer?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export function AuthShell({
    title,
    subtitle,
    backHref,
    backLabel,
    footer,
    children,
    className,
}: AuthShellProps) {
    return (
        <div
            className={cn(
                "relative flex min-h-svh flex-1 flex-col overflow-hidden",
                className,
            )}
        >
            <AnimatedGrid />
            <FloatingOrbs />

            <div className="relative px-4 pt-6 lg:px-8 lg:pt-8">
                <Tooltip>
                    <TooltipTrigger>
                        <Link
                            href={backHref}
                            aria-label={backLabel}
                            className="inline-flex size-9 items-center justify-center rounded-full border bg-background/60 text-muted-foreground backdrop-blur-sm transition-colors hover:border-foreground/25 hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{backLabel}</TooltipContent>
                </Tooltip>
            </div>

            <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-10">
                <div className="w-full max-w-95 animate-fade-up">
                    <div className="mb-8 flex flex-col items-center text-center">
                        <img
                            src="/brand/lockup-light-bg.svg"
                            alt="Dugble"
                            className="h-7 w-auto dark:hidden"
                        />
                        <img
                            src="/brand/lockup-dark-bg.svg"
                            alt="Dugble"
                            className="hidden h-7 w-auto dark:block"
                        />
                        <h1 className="mt-6 font-heading text-[26px] font-semibold leading-tight tracking-tight text-foreground">
                            {title}
                        </h1>
                        <p className="mt-2 max-w-[320px] text-[15px] leading-relaxed text-muted-foreground">
                            {subtitle}
                        </p>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border bg-card p-7 shadow-2xl shadow-black/40">
                        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-signal/50 to-transparent" />
                        {children}
                    </div>

                    {footer && (
                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
