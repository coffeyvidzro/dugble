"use client";

import { useState } from "react";
import Link from "next/link";

import { Check, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AVATAR_PRESETS, initialsFromName } from "./team-avatar-picker";

export function TeamSwitcher({ teamName }: { teamName: string }) {
  const [open, setOpen] = useState(false);
  const initials = initialsFromName(teamName) || "T";
  const preset = AVATAR_PRESETS[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Teams"
            title="Teams"
            className={cn(
              "flex size-10 items-center justify-center rounded-xl border bg-background text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground",
              open && "border-signal/40 text-signal",
            )}
          />
        }
      >
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-lg bg-linear-to-br font-heading text-[10px] font-semibold text-white",
            preset.classes,
          )}
        >
          {initials}
        </span>
      </PopoverTrigger>

      <PopoverContent side="right" align="start" className="w-64 space-y-3 p-3">
        <p className="px-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          Teams
        </p>
        <div className="flex items-center gap-2.5 rounded-lg border bg-card/60 px-3 py-2">
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br font-heading text-[11px] font-semibold text-white",
              preset.classes,
            )}
          >
            {initials}
          </span>
          <span className="flex-1 truncate text-sm font-medium">
            {teamName}
          </span>
          <Check className="size-4 shrink-0 text-signal" />
        </div>
        <Link
          href="/dashboard/create-team"
          onClick={() => setOpen(false)}
          className="flex w-full items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <Plus className="size-4" />
          Create team
        </Link>
      </PopoverContent>
    </Popover>
  );
}
