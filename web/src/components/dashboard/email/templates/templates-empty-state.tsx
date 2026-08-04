"use client";

import { LayoutTemplate, SearchX } from "lucide-react";

type EmptyStateVariant = "no-templates" | "no-results";

export function TemplatesEmptyState({
    variant,
    onClearFilters,
}: {
    variant: EmptyStateVariant;
    onClearFilters: () => void;
}) {
    const isNoResults = variant === "no-results";

    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 px-6 text-center animate-fade-up">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-dashed border-border bg-muted/50">
                {isNoResults ? (
                    <SearchX className="size-5 text-muted-foreground" />
                ) : (
                    <LayoutTemplate className="size-5 text-muted-foreground" />
                )}
            </div>
            <h3 className="mb-1 font-heading text-lg font-medium">
                {isNoResults
                    ? "No templates match your filters"
                    : "No templates yet"}
            </h3>
            <p className="max-w-sm text-sm text-muted-foreground">
                {isNoResults
                    ? "Try adjusting your search or clearing filters to see more results."
                    : "Create your first template to start sending consistent, branded emails."}
            </p>
            {isNoResults && (
                <button
                    type="button"
                    onClick={onClearFilters}
                    className="mt-4 rounded-full border border-border/60 px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}
