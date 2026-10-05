// src/components/dashboard/audience/segments/segment-form-dialog.tsx

"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
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
import { useCreateSegment } from "@/hooks/queries/use-segments";

export function SegmentFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createMutation = useCreateSegment();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset when the dialog re-opens — adjusted during render, not in an effect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName("");
      setError(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Name is required");
      return;
    }

    try {
      await createMutation.mutateAsync({ name: trimmedName });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create segment</DialogTitle>
          <DialogDescription>
            Segments define the audience for campaigns and broadcasts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="segment-name">Name</Label>
            <Input
              id="segment-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Active subscribers"
              maxLength={120}
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border/60 px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {createMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Create segment
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
