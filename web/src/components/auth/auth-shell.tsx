"use client";

import type * as React from "react";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <div className={cn("flex h-full flex-1 flex-col", className)}>
            <div className="px-4 pt-6 lg:px-8 lg:pt-8">
                <Link
                    href={backHref}
                    aria-label={backLabel}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                </Link>
            </div>

            <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-10">
                <div
                    className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-105 w-105 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-[0.06] blur-[110px]"
                    aria-hidden="true"
                />

                <div className="w-full max-w-95">
                    <div className="mb-8 flex flex-col items-center text-center">
                        <span className="inline-flex items-center gap-1.5 text-[17px] font-semibold tracking-tight text-foreground">
                            Dugble
                            <span
                                className="mt-0.5 size-1.5 rounded-full bg-primary"
                                aria-hidden="true"
                            />
                        </span>
                        <h1 className="mt-6 text-[26px] font-semibold leading-tight tracking-tight text-foreground">
                            {title}
                        </h1>
                        <p className="mt-2 max-w-[320px] text-[15px] leading-relaxed text-muted-foreground">
                            {subtitle}
                        </p>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-sm">
                        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />{" "}
                        {children}
                    </div>

                    {footer && (
                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            {footer}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
