"use client";

import { useState } from "react";
import { CopyButton } from "@/components/dashboard/shared/copy-button";
import { cn } from "@/lib/utils";
import {
  type CodeLanguage,
  highlightCode,
  LANGUAGE_META,
  SNIPPETS,
} from "./code-highlight";

const LANGUAGES = Object.keys(SNIPPETS) as CodeLanguage[];

export function CodeTabs() {
  const [language, setLanguage] = useState<CodeLanguage>("node");
  const lines = highlightCode(SNIPPETS[language], language, "theme");

  return (
    <div className="overflow-hidden rounded-xl border bg-muted/40 dark:bg-card">
      <div className="flex items-center justify-between gap-3 border-b bg-background px-2 py-1.5 dark:bg-transparent">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                aria-pressed={language === lang}
                className={cn(
                  "inline-flex h-7 shrink-0 items-center rounded-md px-2.5 text-xs font-medium transition-colors",
                  language === lang
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {LANGUAGE_META[lang].label}
              </button>
            ))}
          </div>
        </div>
        <CopyButton
          value={SNIPPETS[language]}
          label="Copy code"
          className="shrink-0"
        />
      </div>

      <div key={language} className="overflow-x-auto">
        <pre className="p-4 font-mono text-[13px] leading-[21px]">
          <code className="grid">
            {lines.map((tokens, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static code sample; line order never changes.
              <span key={i} className="grid grid-cols-[2rem_1fr] gap-3">
                <span
                  aria-hidden="true"
                  className="select-none text-right text-muted-foreground/60"
                >
                  {i + 1}
                </span>
                <span className="text-foreground">{tokens}</span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
