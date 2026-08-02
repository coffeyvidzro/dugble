"use client";

import { useState } from "react";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CIDR_PATTERN = /^(\d{1,3}\.){3}\d{1,3}(\/(3[0-2]|[12]?\d))?$/;

export function IpAllowlistManager({
    entries,
    onChange,
}: {
    entries: string[];
    onChange: (entries: string[]) => void;
}) {
    const [draft, setDraft] = useState("");
    const [error, setError] = useState<string | null>(null);

    function handleAdd() {
        const value = draft.trim();
        if (!value) return;
        if (!CIDR_PATTERN.test(value)) {
            setError(
                "Enter a valid IP address or CIDR range, e.g. 203.0.113.0/24.",
            );
            return;
        }
        if (entries.includes(value)) {
            setError("That entry is already in your allowlist.");
            return;
        }
        onChange([...entries, value]);
        setDraft("");
        setError(null);
    }

    function handleRemove(value: string) {
        onChange(entries.filter((entry) => entry !== value));
    }

    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
                When entries are added, only requests from these ranges can sign
                in to the dashboard. Your API stays reachable from anywhere.
            </p>

            <div className="flex max-w-md items-start gap-2">
                <div className="flex-1 space-y-1.5">
                    <Input
                        value={draft}
                        onChange={(event) => {
                            setDraft(event.target.value);
                            setError(null);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                handleAdd();
                            }
                        }}
                        placeholder="203.0.113.0/24"
                        className="border-border bg-muted/20 font-mono text-sm text-foreground shadow-sm focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40"
                    />
                    {error && (
                        <p className="text-xs font-medium text-danger animate-fade-up">
                            {error}
                        </p>
                    )}
                </div>
                <Button type="button" variant="outline" onClick={handleAdd}>
                    <Plus className="mr-1.5 size-3.5" />
                    Add
                </Button>
            </div>

            {entries.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                    {entries.map((entry) => (
                        <span
                            key={entry}
                            className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/20 py-1 pl-3 pr-1.5 font-mono text-xs text-foreground"
                        >
                            {entry}
                            <button
                                type="button"
                                onClick={() => handleRemove(entry)}
                                className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                                aria-label={`Remove ${entry}`}
                            >
                                <X className="size-3" />
                            </button>
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground/70">
                    No restrictions yet. The dashboard is reachable from any IP
                    address.
                </p>
            )}
        </div>
    );
}
