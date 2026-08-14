"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type NavSection = {
    id: string;
    title: string;
};

const SCROLL_OFFSET_GAP = 16;

export function LegalSectionNav({ sections }: { sections: NavSection[] }) {
    const mobileBarRef = useRef<HTMLDivElement>(null);
    const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [headerOffset, setHeaderOffset] = useState(64);

    useEffect(() => {
        const header = document.querySelector("header");
        if (!header) return;

        const measure = () => {
            const headerHeight = header.getBoundingClientRect().height;
            const mobileBarHeight =
                mobileBarRef.current?.getBoundingClientRect().height ?? 0;

            setHeaderOffset(headerHeight);
            document.documentElement.style.setProperty(
                "--legal-scroll-offset-desktop",
                `${headerHeight + SCROLL_OFFSET_GAP}px`,
            );
            document.documentElement.style.setProperty(
                "--legal-scroll-offset-mobile",
                `${headerHeight + mobileBarHeight + SCROLL_OFFSET_GAP}px`,
            );
        };

        measure();

        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(header);
        if (mobileBarRef.current) resizeObserver.observe(mobileBarRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        const elements = sections
            .map((section) => document.getElementById(section.id))
            .filter((el): el is HTMLElement => el !== null);

        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top - b.boundingClientRect.top,
                    );

                if (visible[0]) {
                    setActiveId(visible[0].target.id);
                }
            },
            {
                rootMargin: `-${headerOffset + 64}px 0px -70% 0px`,
                threshold: 0,
            },
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [sections, headerOffset]);

    return (
        <div>
            <div
                className="sticky z-30 -mx-6 border-b bg-background/95 px-6 backdrop-blur-md lg:hidden"
                style={{ top: headerOffset }}
            >
                <div ref={mobileBarRef} className="relative py-3">
                    <button
                        type="button"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-expanded={mobileOpen}
                        className="flex w-full items-center justify-between font-mono text-xs uppercase tracking-wide text-muted-foreground"
                    >
                        On this page
                        <ChevronDown
                            className={cn(
                                "size-4 transition-transform duration-200",
                                mobileOpen && "rotate-180",
                            )}
                        />
                    </button>

                    {mobileOpen && (
                        <ul className="absolute inset-x-0 top-full max-h-72 overflow-y-auto rounded-b-2xl border-x border-b bg-background p-2 shadow-lg shadow-black/10">
                            {sections.map((section, i) => (
                                <li key={section.id}>
                                    <a
                                        href={`#${section.id}`}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                            activeId === section.id
                                                ? "bg-signal/10 text-signal"
                                                : "text-muted-foreground hover:text-foreground",
                                        )}
                                    >
                                        <span className="font-mono text-xs">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <nav
                aria-label="Table of contents"
                className="hidden lg:sticky lg:block"
                style={{ top: headerOffset + 16 }}
            >
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    On this page
                </p>
                <ol className="mt-4 space-y-1 border-l">
                    {sections.map((section, i) => (
                        <li key={section.id}>
                            <a
                                href={`#${section.id}`}
                                className={cn(
                                    "-ml-px block border-l px-4 py-1.5 text-sm transition-colors",
                                    activeId === section.id
                                        ? "border-signal text-signal"
                                        : "border-transparent text-muted-foreground hover:text-foreground",
                                )}
                            >
                                <span className="mr-2 font-mono text-xs">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                {section.title}
                            </a>
                        </li>
                    ))}
                </ol>
            </nav>
        </div>
    );
}
