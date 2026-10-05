// src/components/dashboard/team/delete-team-dialog.tsx

"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteTeam } from "@/hooks/queries/use-teams";

export function DeleteTeamDialog({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const deleteTeam = useDeleteTeam();
  const canDelete = confirmation.trim() === teamName;

  function handleDelete() {
    if (!canDelete) return;
    deleteTeam.mutate(teamId, {
      onSuccess: () => {
        toast.success(`${teamName} deleted.`);
        setOpen(false);
        setConfirmation("");
        // This is the team the page was showing — nothing left to
        // render here, so move on to a page that doesn't depend on
        // this team existing.
        router.push("/dashboard/settings/profile");
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirmation("");
      }}
    >
      <Button
        variant="destructive"
        className="bg-danger/90 text-white shadow-sm transition-colors hover:bg-danger"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-2 size-4" />
        Delete Team
      </Button>

      <DialogContent className="border-danger/20 shadow-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-danger">
            Delete &ldquo;{teamName}&rdquo;?
          </DialogTitle>
          <DialogDescription>
            All collaborators will lose access immediately, and production
            workflows relying on this team&apos;s APIs will fail. This action{" "}
            <strong>cannot</strong> be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Label htmlFor="confirm-team-name" className="text-sm font-medium">
            Please type{" "}
            <span className="rounded bg-muted/50 px-1 py-0.5 font-mono text-foreground">
              {teamName}
            </span>{" "}
            to confirm.
          </Label>
          <Input
            id="confirm-team-name"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={teamName}
            disabled={deleteTeam.isPending}
            className="bg-background focus-visible:ring-danger/50"
            autoFocus
          />
        </div>

        <DialogFooter className="border-t border-border/40 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={deleteTeam.isPending}
          >
            Keep Team
          </Button>
          <Button
            type="button"
            disabled={!canDelete || deleteTeam.isPending}
            onClick={handleDelete}
            className="bg-danger text-white transition-colors hover:bg-danger/90"
          >
            {deleteTeam.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            {deleteTeam.isPending ? "Deleting..." : "Permanently Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
