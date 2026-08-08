"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CopyButton } from "../../shared/copy-button";
import {
    highlightCode,
    LANGUAGE_META,
    SNIPPETS,
    type CodeLanguage,
} from "./code-highlight";

const LANGUAGES = Object.keys(SNIPPETS) as CodeLanguage[];

export function CodeTabs() {
    const [language, setLanguage] = useState<CodeLanguage>("node");
    const lines = highlightCode(SNIPPETS[language], language);

    return (
        <div className="overflow-hidden rounded-lg border border-border/40 bg-zinc-950">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
                <div className="flex min-w-0 items-center gap-3">
                    <div
                        className="hidden shrink-0 items-center gap-1.5 sm:flex"
                        aria-hidden="true"
                    >
                        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                        <span className="size-2.5 rounded-full bg-[#febc2e]" />
                        <span className="size-2.5 rounded-full bg-[#28c840]" />
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang}
                                type="button"
                                onClick={() => setLanguage(lang)}
                                aria-pressed={language === lang}
                                className={cn(
                                    "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-colors",
                                    language === lang
                                        ? "bg-white/10 text-white"
                                        : "text-zinc-500 hover:text-zinc-300",
                                )}
                            >
                                <span
                                    className={cn(
                                        "size-1.5 rounded-full",
                                        LANGUAGE_META[lang].accent,
                                    )}
                                    aria-hidden="true"
                                />
                                {LANGUAGE_META[lang].label}
                            </button>
                        ))}
                    </div>
                </div>
                <CopyButton
                    value={SNIPPETS[language]}
                    label="Copy code"
                    className="shrink-0 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
                />
            </div>

            <div key={language} className="animate-fade-up overflow-x-auto">
                <pre className="p-4 text-xs leading-relaxed">
                    <code className="grid">
                        {lines.map((tokens, i) => (
                            <span
                                key={i}
                                className="grid grid-cols-[2rem_1fr] gap-3"
                            >
                                <span
                                    aria-hidden="true"
                                    className="select-none text-right text-zinc-600"
                                >
                                    {i + 1}
                                </span>
                                <span className="text-zinc-300">
                                    {tokens}
                                </span>
                            </span>
                        ))}
                    </code>
                </pre>
            </div>
        </div>
    );
}
