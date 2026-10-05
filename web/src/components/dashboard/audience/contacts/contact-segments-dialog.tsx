"use client";

import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAddContactToSegment,
  useContactSegments,
  useRemoveContactFromSegment,
} from "@/hooks/queries/use-contacts";
import { useSegments } from "@/hooks/queries/use-segments";
import type { Contact } from "@/types/contact";

export function ContactSegmentsDialog({
  contact,
  onOpenChange,
}: {
  contact: Contact | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = Boolean(contact);
  const contactId = contact?.id ?? "";

  const { data: allSegments = [], isLoading: isLoadingSegments } =
    useSegments();
  const { data: memberSegments = [], isLoading: isLoadingMemberships } =
    useContactSegments(contactId, open);

  const addMutation = useAddContactToSegment(contactId);
  const removeMutation = useRemoveContactFromSegment(contactId);

  const memberIds = new Set(memberSegments.map((s) => s.id));
  const isLoading = isLoadingSegments || isLoadingMemberships;
  const isMutating = addMutation.isPending || removeMutation.isPending;

  function toggle(segmentId: string, isMember: boolean) {
    if (isMember) {
      removeMutation.mutate(segmentId);
    } else {
      addMutation.mutate(segmentId);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage segments</DialogTitle>
          <DialogDescription>
            Choose which segments{" "}
            <span className="font-mono text-foreground">{contact?.email}</span>{" "}
            belongs to.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading segments…
          </div>
        ) : allSegments.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">
            No segments exist yet. Create one from the Segments page first.
          </p>
        ) : (
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {allSegments.map((segment) => {
              const isMember = memberIds.has(segment.id);
              return (
                <label
                  key={segment.id}
                  className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-muted/50"
                >
                  <span className="text-foreground">{segment.name}</span>
                  <input
                    type="checkbox"
                    checked={isMember}
                    disabled={isMutating}
                    onChange={() => toggle(segment.id, isMember)}
                    className="size-4 rounded border-border/60"
                  />
                </label>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
