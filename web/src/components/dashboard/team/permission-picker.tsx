"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  PERMISSION_PRESETS,
  type PermissionPresetKey,
  TEAM_TOKEN_PERMISSION_CATEGORIES,
} from "@/lib/team-token-permissions";
import { cn } from "@/lib/utils";

type PermissionPickerProps = {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

const PRESET_DESCRIPTIONS: Record<PermissionPresetKey, string> = {
  read_only: "View access across every resource",
  member: "Everything a member can do, plus broadcasts",
  admin: "Full administrative access across all resources",
  owner: "Unrestricted — every permission available",
};

function permissionSetsMatch(selected: Set<string>, preset: readonly string[]) {
  if (selected.size !== preset.length) return false;
  return preset.every((p) => selected.has(p));
}

export function PermissionPicker({
  value,
  onChange,
  disabled,
}: PermissionPickerProps) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const selected = useMemo(() => new Set(value), [value]);

  const activePreset = useMemo(() => {
    const entries = Object.entries(PERMISSION_PRESETS) as [
      PermissionPresetKey,
      (typeof PERMISSION_PRESETS)[PermissionPresetKey],
    ][];
    return entries.find(([, preset]) =>
      permissionSetsMatch(selected, preset.permissions),
    )?.[0];
  }, [selected]);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TEAM_TOKEN_PERMISSION_CATEGORIES;
    return TEAM_TOKEN_PERMISSION_CATEGORIES.map((category) => ({
      ...category,
      permissions: category.permissions.filter(
        (p) =>
          p.label.toLowerCase().includes(q) ||
          p.value.toLowerCase().includes(q),
      ),
    })).filter((category) => category.permissions.length > 0);
  }, [query]);

  function togglePermission(permValue: string, checked: boolean) {
    const next = new Set(selected);
    checked ? next.add(permValue) : next.delete(permValue);
    onChange(Array.from(next));
  }

  function toggleCategory(categoryId: string, checked: boolean) {
    const category = TEAM_TOKEN_PERMISSION_CATEGORIES.find(
      (c) => c.id === categoryId,
    );
    if (!category) return;
    const values = category.permissions.map((p) => p.value);
    const next = new Set(selected);
    for (const value of values) {
      if (checked) next.add(value);
      else next.delete(value);
    }
    onChange(Array.from(next));
  }

  function toggleCollapsed(categoryId: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      next.has(categoryId) ? next.delete(categoryId) : next.add(categoryId);
      return next;
    });
  }

  function applyPreset(key: PermissionPresetKey) {
    onChange([...PERMISSION_PRESETS[key].permissions]);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Quick presets
          </span>
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              disabled={disabled}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-danger disabled:pointer-events-none disabled:opacity-50"
            >
              <X className="size-3" />
              Clear selection
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {(
            Object.entries(PERMISSION_PRESETS) as [
              PermissionPresetKey,
              (typeof PERMISSION_PRESETS)[PermissionPresetKey],
            ][]
          ).map(([key, preset]) => {
            const isActive = activePreset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                disabled={disabled}
                aria-pressed={isActive}
                className={cn(
                  "relative flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-all disabled:pointer-events-none disabled:opacity-50",
                  isActive
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
                    : "border-input hover:border-border hover:bg-muted/30",
                )}
              >
                {isActive && (
                  <Check className="absolute right-2 top-2 size-3.5 text-primary" />
                )}
                <span className="pr-4 text-sm font-semibold text-foreground">
                  {preset.label}
                </span>
                <span className="text-xs leading-snug text-muted-foreground">
                  {PRESET_DESCRIPTIONS[key]}
                </span>
                <span className="mt-1 text-[11px] font-medium text-muted-foreground">
                  {preset.permissions.length} permissions
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search permissions"
          disabled={disabled}
          className="border-input bg-background pl-9 text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-input">
        <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
          {filteredCategories.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No permissions match &quot;{query}&quot;.
            </p>
          ) : (
            filteredCategories.map((category) => {
              const values = category.permissions.map((p) => p.value);
              const selectedCount = values.filter((v) =>
                selected.has(v),
              ).length;
              const allSelected = selectedCount === values.length;
              const someSelected = selectedCount > 0 && !allSelected;
              const isCollapsed = collapsed.has(category.id);

              return (
                <div key={category.id} className="bg-card">
                  <div className="sticky top-0 z-10 flex items-center gap-2.5 bg-card px-3 py-2.5">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onCheckedChange={(checked) =>
                        toggleCategory(category.id, checked === true)
                      }
                      disabled={disabled}
                    />
                    <button
                      type="button"
                      onClick={() => toggleCollapsed(category.id)}
                      className="flex flex-1 items-center justify-between gap-2 text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {category.label}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                            selectedCount > 0
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {selectedCount}/{values.length}
                        </span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform",
                          !isCollapsed && "rotate-180",
                        )}
                      />
                    </button>
                  </div>

                  {!isCollapsed && (
                    <div className="grid grid-cols-1 gap-1 px-3 pb-3 pl-9 sm:grid-cols-2">
                      {category.permissions.map((perm) => (
                        <label
                          key={perm.value}
                          className="flex cursor-pointer items-start gap-2 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-muted/30"
                        >
                          <Checkbox
                            checked={selected.has(perm.value)}
                            onCheckedChange={(checked) =>
                              togglePermission(perm.value, checked === true)
                            }
                            disabled={disabled}
                            className="mt-0.5"
                          />
                          <span className="leading-snug text-foreground/90">
                            {perm.label}
                            <code className="ml-1.5 text-[11px] text-muted-foreground">
                              {perm.value}
                            </code>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-input bg-muted/20 px-3 py-2">
        <span className="text-xs text-muted-foreground">
          {value.length === 0
            ? "No permissions selected"
            : `${value.length} permission${value.length === 1 ? "" : "s"} selected`}
        </span>
        {activePreset && (
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            <Check className="size-3" />
            Matches {PERMISSION_PRESETS[activePreset].label}
          </span>
        )}
      </div>
    </div>
  );
}
