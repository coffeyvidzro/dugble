"use client";

import { Building2, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTeamPermissions } from "@/hooks/queries/use-team-permissions";
import { useTeam, useUpdateTeam } from "@/hooks/queries/use-teams";
import { cn } from "@/lib/utils";
import { updateTeamInputSchema } from "@/types/team";

const MAX_NAME_LENGTH = 60;

export function TeamOverviewForm({ teamId }: { teamId: string }) {
  const { data: team, isPending, isError, error } = useTeam(teamId);
  const updateTeam = useUpdateTeam(teamId);
  const { canManageTeam } = useTeamPermissions();
  const [name, setName] = useState<string | null>(null);

  if (isPending) {
    return (
      <CardContent className="flex justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </CardContent>
    );
  }

  if (isError) {
    return (
      <CardContent className="py-8 text-center">
        <p className="text-sm font-medium text-danger">
          Couldn&apos;t load this team.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
      </CardContent>
    );
  }

  const currentName = name ?? team.name;
  const isDirty =
    currentName.trim() !== team.name && currentName.trim().length > 0;

  function handleSave() {
    const result = updateTeamInputSchema.safeParse({
      name: currentName.trim(),
    });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Invalid team name.");
      return;
    }
    updateTeam.mutate(result.data, {
      onSuccess: (updated) => {
        setName(updated.name);
        toast.success("Team name updated.");
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-muted/30 text-muted-foreground">
            <Building2 className="size-6" />
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="team-name" className="text-sm font-medium">
                Team name
              </Label>
              <span className="font-mono text-[11px] text-muted-foreground/70">
                {currentName.length}/{MAX_NAME_LENGTH}
              </span>
            </div>
            <Input
              id="team-name"
              value={currentName}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Acme Corp"
              maxLength={MAX_NAME_LENGTH}
              disabled={!canManageTeam || updateTeam.isPending}
              className="max-w-sm rounded-lg border border-border/60 bg-muted/20 py-2 pl-4 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60"
            />
            <p className="text-xs text-muted-foreground">
              This name appears across your dashboard and in emails sent on this
              team&apos;s behalf.
            </p>
          </div>
        </div>
      </CardContent>

      {canManageTeam && (
        <div className="flex items-center justify-end gap-4 border-t border-border/40 bg-muted/10 px-6 py-4">
          {updateTeam.isSuccess && !updateTeam.isPending && !isDirty && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-signal animate-fade-up">
              <Check className="size-4" />
              Saved successfully
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={!isDirty || updateTeam.isPending}
            className={cn(
              "group/button relative inline-flex min-w-30 shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20",
              updateTeam.isPending && "opacity-80",
            )}
          >
            {updateTeam.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {updateTeam.isPending ? "Saving..." : "Save changes"}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
            />
          </Button>
        </div>
      )}
    </>
  );
}
