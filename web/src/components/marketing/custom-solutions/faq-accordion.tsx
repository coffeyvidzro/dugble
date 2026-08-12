"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import type { Faq } from "@/components/marketing/custom-solutions/custom-solutions-data";
import { cn } from "@/lib/utils";

export function FaqAccordion({ items }: { items: Faq[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="divide-y rounded-2xl border bg-card/60">
            {items.map((item, index) => {
                const open = openIndex === index;
                return (
                    <div key={item.question}>
                        <button
                            type="button"
                            onClick={() => setOpenIndex(open ? null : index)}
                            aria-expanded={open}
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                        >
                            <span className="font-medium">{item.question}</span>
                            <ChevronDown
                                aria-hidden
                                className={cn(
                                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                                    open && "rotate-180 text-signal",
                                )}
                            />
                        </button>
                        <div
                            className={cn(
                                "grid transition-all duration-300 ease-out motion-reduce:transition-none",
                                open
                                    ? "grid-rows-[1fr] opacity-100"
                                    : "grid-rows-[0fr] opacity-0",
                            )}
                        >
                            <div className="overflow-hidden">
                                <p className="px-5 pb-4 text-sm leading-6 text-muted-foreground">
                                    {item.answer}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
