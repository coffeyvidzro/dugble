import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavLink = {
    href: string;
    title: string;
    description?: string;
};

interface MobileNavProps {
    open: boolean;
    onNavigate: () => void;
    featuresLinks: NavLink[];
    resourceLinks: NavLink[];
}

export function MobileNav({
    open,
    onNavigate,
    featuresLinks,
    resourceLinks,
}: MobileNavProps) {
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-hidden={!open}
            className={cn(
                "fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background pt-24 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none md:hidden",
                open
                    ? "translate-x-0"
                    : "-translate-x-full pointer-events-none",
            )}
        >
            <nav className="flex-1 space-y-10 px-6 pb-10">
                <NavGroup
                    title="Product"
                    links={featuresLinks}
                    open={open}
                    onNavigate={onNavigate}
                    delayStart={0}
                />
                <NavGroup
                    title="Resources"
                    links={resourceLinks}
                    open={open}
                    onNavigate={onNavigate}
                    delayStart={featuresLinks.length}
                />
                <StaggerItem
                    open={open}
                    index={featuresLinks.length + resourceLinks.length}
                >
                    <Link
                        href="/contact"
                        onClick={onNavigate}
                        className="font-heading text-2xl font-semibold tracking-tight"
                    >
                        Contact
                    </Link>
                </StaggerItem>
            </nav>

            <StaggerItem
                open={open}
                index={featuresLinks.length + resourceLinks.length + 1}
                className="flex flex-row items-center gap-3 border-t px-6 py-6"
            >
                <Link
                    href="/login"
                    onClick={onNavigate}
                    className="group/button relative inline-flex h-10 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full border bg-background px-4 font-mono text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-lg hover:shadow-black/20"
                >
                    <span>Sign in</span>
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                    />
                </Link>
                <Link
                    href="/sign-up"
                    onClick={onNavigate}
                    className={cn(
                        buttonVariants({ size: "lg" }),
                        "flex-1 justify-center",
                    )}
                >
                    Start building
                </Link>
            </StaggerItem>
        </div>
    );
}

function NavGroup({
    title,
    links,
    open,
    onNavigate,
    delayStart,
}: {
    title: string;
    links: NavLink[];
    open: boolean;
    onNavigate: () => void;
    delayStart: number;
}) {
    return (
        <div className="space-y-4">
            <StaggerItem open={open} index={delayStart}>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {title}
                </p>
            </StaggerItem>
            <ul className="space-y-5">
                {links.map((link, i) => (
                    <StaggerItem
                        key={link.href}
                        as="li"
                        open={open}
                        index={delayStart + i + 1}
                    >
                        <Link
                            href={link.href}
                            onClick={onNavigate}
                            className="block font-heading text-2xl font-semibold tracking-tight transition-colors hover:text-signal"
                        >
                            {link.title}
                        </Link>
                        {link.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {link.description}
                            </p>
                        )}
                    </StaggerItem>
                ))}
            </ul>
        </div>
    );
}

function StaggerItem({
    open,
    index,
    as: Tag = "div",
    className,
    children,
}: {
    open: boolean;
    index: number;
    as?: "div" | "li";
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <Tag
            className={cn(
                "transition-all duration-500 ease-out motion-reduce:transition-none",
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                className,
            )}
            style={{ transitionDelay: open ? `${index * 45 + 80}ms` : "0ms" }}
        >
            {children}
        </Tag>
    );
}
