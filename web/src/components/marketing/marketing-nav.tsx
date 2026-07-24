"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { MobileNav } from "./mobile-nav";

const featuresLinks = [
    {
        href: "/features/sms-api",
        title: "SMS API",
        description: "OTP, alerts, and transactional A2P SMS.",
    },
    {
        href: "/features/email-api",
        title: "Email API",
        description: "Receipts, password resets, and lifecycle email.",
    },
    {
        href: "/features/webhooks",
        title: "Webhooks",
        description: "Delivery events, retries, and signatures.",
    },
    {
        href: "/features/a2p-api",
        title: "A2P API",
        description: "One API for every messaging channel.",
    },
];

const resourceLinks = [
    { href: "/quickstart", title: "Quickstart" },
    { href: "/security", title: "Security" },
    { href: "/pricing", title: "Pricing" },
    { href: "/blog", title: "Blog" },
];

export function MarketingNav() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        const onResize = () => {
            if (window.innerWidth >= 768) setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("resize", onResize);
        };
    }, [open]);

    return (
        <>
            <header
                className={cn(
                    "sticky top-0 z-60 w-full transition-[background-color,border-color,backdrop-filter] duration-300",
                    scrolled || open
                        ? "border-b bg-background/75 backdrop-blur-md"
                        : "border-b border-transparent bg-transparent",
                )}
            >
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
                    <Link
                        href="/"
                        className="font-heading text-lg font-semibold tracking-tight transition-opacity hover:opacity-80"
                    >
                        Dugble
                    </Link>

                    <NavigationMenu className="hidden md:flex">
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>
                                    Features
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="grid w-136 gap-2 p-2 md:grid-cols-2">
                                        {featuresLinks.map((link) => (
                                            <NavigationMenuLink
                                                key={link.href}
                                                href={link.href}
                                            >
                                                <div className="space-y-1">
                                                    <p className="font-medium text-foreground">
                                                        {link.title}
                                                    </p>
                                                    <p className="text-muted-foreground text-xs leading-5">
                                                        {link.description}
                                                    </p>
                                                </div>
                                            </NavigationMenuLink>
                                        ))}
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>
                                    Resources
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="grid w-90 gap-1 p-2">
                                        {resourceLinks.map((link) => (
                                            <NavigationMenuLink
                                                key={link.href}
                                                href={link.href}
                                            >
                                                {link.title}
                                            </NavigationMenuLink>
                                        ))}
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink href="/contact">
                                    Contact
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    <div className="hidden items-center gap-2 md:flex">
                        <Link
                            href="/login"
                            className="group/button relative inline-flex h-9 shrink-0 items-center gap-2 overflow-hidden rounded-full border bg-background px-4 font-mono text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-lg hover:shadow-black/20"
                        >
                            Sign in
                            <span
                                aria-hidden
                                className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                            />
                        </Link>
                        <Link href="/sign-up" className={buttonVariants()}>
                            Start building
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                        className="flex size-9 items-center justify-center rounded-md border transition-colors hover:border-foreground/30 md:hidden"
                    >
                        <div className="flex h-3.5 w-4 flex-col justify-between">
                            <span
                                className={cn(
                                    "h-px w-full origin-center bg-foreground transition-transform duration-300 motion-reduce:transition-none",
                                    open && "translate-y-[6.5px] rotate-45",
                                )}
                            />
                            <span
                                className={cn(
                                    "h-px w-full bg-foreground transition-opacity duration-200 motion-reduce:transition-none",
                                    open && "opacity-0",
                                )}
                            />
                            <span
                                className={cn(
                                    "h-px w-full origin-center bg-foreground transition-transform duration-300 motion-reduce:transition-none",
                                    open && "translate-y-[-6.5px] -rotate-45",
                                )}
                            />
                        </div>
                    </button>
                </div>
            </header>

            <MobileNav
                open={open}
                onNavigate={() => setOpen(false)}
                featuresLinks={featuresLinks}
                resourceLinks={resourceLinks}
            />
        </>
    );
}
