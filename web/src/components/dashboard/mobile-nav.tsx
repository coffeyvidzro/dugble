"use client";

import type { CSSProperties } from "react";
import { useEffect } from "react";
import Link from "next/link";

import { Building2, LayoutGrid, Plus, X } from "lucide-react";

import { dashboardPortals, type DashboardPortal } from "./dashboard-nav";
import { NavGroupList } from "./nav-group-list";
import type { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

const CURRENT_WORKSPACE = "My Workspace";

export function MobileNav({
    user,
    open,
    onOpenChange,
    activePortal,
}: {
    user: SessionUser;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activePortal: DashboardPortal | null;
}) {
    const displayName = user.name.trim() || user.email;
    const initials = displayName.slice(0, 2).toUpperCase();

    // Lock body scroll while the drawer is open.
    useEffect(() => {
        if (!open) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, [open]);

    // Close on Escape.
    useEffect(() => {
        if (!open) return;
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") onOpenChange(false);
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onOpenChange]);

    return (
        <div className="lg:hidden">
            {/* Backdrop */}
            <div
                aria-hidden
                onClick={() => onOpenChange(false)}
                className={cn(
                    "fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300",
                    open ? "opacity-100" : "pointer-events-none opacity-0",
                )}
            />

            {/* Panel */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Dashboard navigation"
                aria-hidden={!open}
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-xs flex-col bg-sidebar shadow-2xl transition-transform duration-300 ease-out",
                    open ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex h-14 shrink-0 items-center justify-between border-b px-4 md:hidden">
                    <Link
                        href="/dashboard"
                        onClick={() => onOpenChange(false)}
                        className="flex items-center gap-2"
                    >
                        <img
                            src="/brand/mark-light-bg.svg"
                            alt=""
                            className="size-7 rounded-lg dark:hidden"
                        />
                        <img
                            src="/brand/mark-dark-bg.svg"
                            alt=""
                            className="hidden size-7 rounded-lg dark:block"
                        />
                        <span className="font-heading text-sm font-semibold">
                            Dugble
                        </span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        aria-label="Close navigation"
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2.5 border-b px-4 py-3 md:hidden">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                        <Building2 className="size-3.5" />
                    </div>
                    <span className="flex-1 truncate text-sm font-medium">
                        {CURRENT_WORKSPACE}
                    </span>
                    <Link
                        href="/dashboard/create-workspace"
                        onClick={() => onOpenChange(false)}
                        aria-label="Add workspace"
                        className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                        <Plus className="size-3.5" />
                    </Link>
                </div>

                <div className="border-b px-4 py-3 md:hidden">
                    <p className="mb-2.5 px-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                        Portals
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {dashboardPortals.map((portal, i) => {
                            const isActive = portal.id === activePortal?.id;
                            const firstHref = portal.groups[0]?.items[0]?.href;
                            return (
                                <Link
                                    key={portal.id}
                                    href={firstHref ?? "/dashboard"}
                                    onClick={() => onOpenChange(false)}
                                    style={
                                        {
                                            animationDelay: `${i * 40}ms`,
                                        } as CSSProperties
                                    }
                                    className={cn(
                                        "animate-fade-up group relative flex items-center gap-2 overflow-hidden rounded-xl border px-2.5 py-2.5 text-left transition-all duration-200 active:scale-[0.97]",
                                        isActive
                                            ? "border-signal/40 bg-signal/10"
                                            : "border-transparent bg-muted/50 hover:bg-muted",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "flex size-7 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200",
                                            isActive
                                                ? "border-signal/30 bg-background text-signal"
                                                : "border-border/60 bg-background text-muted-foreground group-hover:text-foreground",
                                        )}
                                    >
                                        <portal.icon className="size-3.5" />
                                    </span>
                                    <span
                                        className={cn(
                                            "truncate text-xs font-medium",
                                            isActive
                                                ? "text-signal"
                                                : "text-foreground/80",
                                        )}
                                    >
                                        {portal.label}
                                    </span>
                                    {isActive && (
                                        <span
                                            aria-hidden
                                            className="absolute right-2 top-2 flex size-1.5"
                                        >
                                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-signal/60 motion-reduce:animate-none" />
                                            <span className="relative inline-flex size-1.5 rounded-full bg-signal" />
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="hidden items-center justify-between border-b px-4 py-3 md:flex">
                    <p className="font-heading text-sm font-semibold tracking-tight">
                        {activePortal?.label ?? "Navigation"}
                    </p>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        aria-label="Close navigation"
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4">
                    {activePortal ? (
                        <div className="flex flex-col gap-6">
                            <NavGroupList
                                groups={activePortal.groups}
                                onNavigate={() => onOpenChange(false)}
                            />
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2.5 px-6 text-center">
                            <div className="flex size-9 items-center justify-center rounded-xl border bg-background text-muted-foreground">
                                <LayoutGrid className="size-4" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Select a portal above to browse its pages.
                            </p>
                        </div>
                    )}
                </div>

                <Link
                    href="/dashboard/settings/profile"
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-2.5 border-t px-4 py-3 md:hidden"
                >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted font-medium text-xs text-muted-foreground">
                        {initials}
                    </span>
                    <span className="flex-1 truncate text-sm">
                        {displayName}
                    </span>
                </Link>
            </div>
        </div>
    );
}
