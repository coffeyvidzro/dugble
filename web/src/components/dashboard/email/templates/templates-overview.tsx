"use client";

import { useMemo, useState } from "react";

import { TemplatesEmptyState } from "./templates-empty-state";
import { TemplatesToolbar } from "./templates-toolbar";
import { TemplatesHeader } from "./templates-header";
import { useTemplatesStore } from "./templates-store";
import { TemplatesStats } from "./templates-stats";
import { TemplateList } from "./template-list";
import { TemplateGrid } from "./template-grid";
import {
    type TemplateCategory,
    type TemplateStatus,
    type TemplateViewMode,
} from "./types";

export function TemplatesOverview() {
    const { templates } = useTemplatesStore();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<TemplateCategory | "all">("all");
    const [status, setStatus] = useState<TemplateStatus | "all">("all");
    const [view, setView] = useState<TemplateViewMode>("grid");

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        return templates
            .filter((template) => {
                const matchesQuery =
                    query.length === 0 ||
                    template.name.toLowerCase().includes(query) ||
                    template.subject.toLowerCase().includes(query) ||
                    template.description.toLowerCase().includes(query);
                const matchesCategory =
                    category === "all" || template.category === category;
                const matchesStatus =
                    status === "all" || template.status === status;

                return matchesQuery && matchesCategory && matchesStatus;
            })
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }, [templates, search, category, status]);

    const hasActiveFilters =
        search.trim().length > 0 || category !== "all" || status !== "all";

    function resetFilters() {
        setSearch("");
        setCategory("all");
        setStatus("all");
    }

    return (
        <div className="mx-auto w-full max-w-6xl pb-6">
            <TemplatesHeader totalCount={templates.length} />

            <div className="space-y-6">
                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "100ms",
                        animationFillMode: "both",
                    }}
                >
                    <TemplatesStats templates={templates} />
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "150ms",
                        animationFillMode: "both",
                    }}
                >
                    <TemplatesToolbar
                        search={search}
                        onSearchChange={setSearch}
                        category={category}
                        onCategoryChange={setCategory}
                        status={status}
                        onStatusChange={setStatus}
                        view={view}
                        onViewChange={setView}
                    />
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "200ms",
                        animationFillMode: "both",
                    }}
                >
                    {filtered.length === 0 ? (
                        <TemplatesEmptyState
                            variant={
                                hasActiveFilters ? "no-results" : "no-templates"
                            }
                            onClearFilters={resetFilters}
                        />
                    ) : view === "grid" ? (
                        <TemplateGrid templates={filtered} />
                    ) : (
                        <TemplateList templates={filtered} />
                    )}
                </div>
            </div>
        </div>
    );
}
