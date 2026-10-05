"use client";

import { Loader2 } from "lucide-react";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useMemo } from "react";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import { useTemplatesApi } from "@/hooks/queries/use-templates-api";
import { TemplateGrid } from "./template-grid";
import { TemplateList } from "./template-list";
import { TemplatesEmptyState } from "./templates-empty-state";
import { TemplatesHeader } from "./templates-header";
import { TemplatesStats } from "./templates-stats";
import { TemplatesToolbar } from "./templates-toolbar";
import {
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
  type TemplateStatus,
  type TemplateViewMode,
} from "./types";

const templateSearchParams = {
  q: parseAsString.withDefault(""),
  category: parseAsStringLiteral([
    "all",
    ...TEMPLATE_CATEGORIES,
  ] as const).withDefault("all"),
  status: parseAsStringLiteral([
    "all",
    "draft",
    "published",
  ] as const).withDefault("all"),
  view: parseAsStringLiteral(["grid", "list"] as const).withDefault("grid"),
};

function TemplatesOverviewContent() {
  const { data, isPending, isError } = useTemplatesApi({ limit: 100 });
  const templates = data?.data ?? [];

  const [params, setParams] = useQueryStates(templateSearchParams, {
    history: "replace",
  });
  const { q: search, category, status, view } = params;
  const setSearch = (value: string) => void setParams({ q: value || null });
  const setCategory = (value: TemplateCategory | "all") =>
    void setParams({ category: value });
  const setStatus = (value: TemplateStatus | "all") =>
    void setParams({ status: value });
  const setView = (value: TemplateViewMode) => void setParams({ view: value });

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return templates
      .filter((template) => {
        const matchesQuery =
          query.length === 0 ||
          template.name.toLowerCase().includes(query) ||
          (template.alias ?? "").toLowerCase().includes(query);
        const matchesCategory =
          category === "all" || template.category === category;
        const matchesStatus = status === "all" || template.status === status;

        return matchesQuery && matchesCategory && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
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
          {isError ? (
            <p className="py-16 text-center text-sm text-danger">
              Couldn&apos;t load templates. Try refreshing the page.
            </p>
          ) : isPending ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading templates…
            </div>
          ) : filtered.length === 0 ? (
            <TemplatesEmptyState
              variant={hasActiveFilters ? "no-results" : "no-templates"}
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

export function TemplatesOverview() {
  return (
    <RequireActiveTeam description="Create or select a team to manage templates.">
      <TemplatesOverviewContent />
    </RequireActiveTeam>
  );
}
