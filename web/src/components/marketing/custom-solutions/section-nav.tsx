"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type SectionNavItem = {
    id: string;
    label: string;
};

const SCROLL_OFFSET_GAP = 16;

export function SectionNav({ items }: { items: SectionNavItem[] }) {
    const navRef = useRef<HTMLElement>(null);
    const [activeId, setActiveId] = useState(items[0]?.id ?? "");
    const [headerOffset, setHeaderOffset] = useState(64);
    useEffect(() => {
        const header = document.querySelector("header");
        if (!header) return;

        const measure = () => {
            const headerHeight = header.getBoundingClientRect().height;
            const navHeight =
                navRef.current?.getBoundingClientRect().height ?? 0;

            setHeaderOffset(headerHeight);
            document.documentElement.style.setProperty(
                "--cs-sticky-offset",
                `${headerHeight + navHeight + SCROLL_OFFSET_GAP}px`,
            );
        };

        measure();

        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(header);
        if (navRef.current) resizeObserver.observe(navRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        const elements = items
            .map((item) => document.getElementById(item.id))
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
                rootMargin: `-${headerOffset + 96}px 0px -60% 0px`,
                threshold: 0,
            },
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [items, headerOffset]);

    return (
        <nav
            ref={navRef}
            aria-label="Page sections"
            style={{ top: headerOffset }}
            className="sticky z-40 overflow-x-auto rounded-full border bg-background/90 px-2 py-2 backdrop-blur-md no-scrollbar"
        >
            <ul className="flex w-max items-center gap-1">
                {items.map((item) => (
                    <li key={item.id}>
                        <a
                            href={`#${item.id}`}
                            className={cn(
                                "inline-flex items-center whitespace-nowrap rounded-full px-3.5 py-1.5 font-mono text-xs transition-colors",
                                activeId === item.id
                                    ? "bg-signal/10 text-signal"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
