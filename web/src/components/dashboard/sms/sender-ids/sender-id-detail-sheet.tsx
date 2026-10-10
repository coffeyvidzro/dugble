import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDeleteSenderId } from "@/hooks/queries/use-sender-ids";
import type { SenderId } from "@/types/sender-id";
import { formatDate } from "../sms-dashboard/types";
import { SenderIdStatusBadge } from "./sender-id-status-badge";

export function SenderIdDetailSheet({
  senderId,
  open,
  onOpenChange,
}: {
  senderId: SenderId | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteSenderId = useDeleteSenderId();
  const [confirming, setConfirming] = useState(false);

  function handleDisable() {
    if (!senderId) return;
    deleteSenderId.mutate(senderId.id, {
      onSuccess: () => {
        setConfirming(false);
        onOpenChange(false);
      },
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setConfirming(false);
        onOpenChange(next);
      }}
    >
      <SheetContent className="overflow-y-auto sm:max-w-md">
        {senderId && (
          <>
            <SheetHeader>
              <div className="flex items-center justify-between gap-3">
                <SheetTitle className="font-mono">{senderId.name}</SheetTitle>
                <SenderIdStatusBadge status={senderId.status} />
              </div>
              <SheetDescription>{senderId.country_code}</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-4 pb-6 sm:px-6">
              {senderId.status === "rejected" && senderId.rejection_reason && (
                <div className="flex gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                  <AlertTriangle className="size-4 shrink-0" />
                  <p>{senderId.rejection_reason}</p>
                </div>
              )}

              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Purpose
                </p>
                <p className="text-sm text-foreground">{senderId.purpose}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <Field
                  label="Created"
                  value={formatDate(new Date(senderId.created_at))}
                />
                {senderId.approved_at && (
                  <Field
                    label="Approved"
                    value={formatDate(new Date(senderId.approved_at))}
                  />
                )}
                {senderId.rejected_at && (
                  <Field
                    label="Rejected"
                    value={formatDate(new Date(senderId.rejected_at))}
                  />
                )}
                {senderId.suspended_at && (
                  <Field
                    label="Suspended"
                    value={formatDate(new Date(senderId.suspended_at))}
                  />
                )}
              </div>

              {senderId.status !== "inactive" && (
                <div className="border-t border-border/40 pt-4">
                  {confirming ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Disable{" "}
                        <span className="font-mono text-foreground">
                          {senderId.name}
                        </span>
                        ? It will stop being usable for sending.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleDisable}
                          disabled={deleteSenderId.isPending}
                          className="inline-flex items-center gap-1.5 rounded-full bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90 disabled:opacity-60"
                        >
                          {deleteSenderId.isPending ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                          Confirm disable
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirming(false)}
                          className="rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirming(true)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
                    >
                      <Trash2 className="size-3.5" />
                      Disable sender ID
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
