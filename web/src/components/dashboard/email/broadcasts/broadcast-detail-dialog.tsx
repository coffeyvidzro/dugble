"use client";

import {
  CheckCircle2,
  Copy,
  Loader2,
  MousePointerClick,
  Send,
  Users,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBroadcastAnalytics } from "@/hooks/queries/use-broadcasts-api";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import type { Broadcast } from "@/types/broadcast-api";
import type { Segment } from "@/types/segment";
import { BroadcastStatusBadge } from "./broadcast-status-badge";
import { formatDateTimeFull } from "./format";

export function BroadcastDetailDialog({
  broadcast,
  segment,
  onOpenChange,
}: {
  broadcast: Broadcast | null;
  segment: Segment | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const { copied, copy, reset: resetCopied } = useCopyToClipboard(2000);
  const analytics = useBroadcastAnalytics(broadcast?.id ?? "");

  function handleCopySubject() {
    if (broadcast) void copy(broadcast.subject);
  }

  return (
    <Dialog
      open={broadcast !== null}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) resetCopied();
      }}
    >
      <DialogContent className="sm:max-w-md border-border/40 shadow-xl">
        {broadcast && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle className="truncate">
                  {broadcast.subject}
                </DialogTitle>
                <button
                  type="button"
                  onClick={handleCopySubject}
                  className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
                  aria-label="Copy subject"
                >
                  <Copy className={cn("size-3.5", copied && "text-signal")} />
                </button>
              </div>
              <DialogDescription>
                To {segment?.name ?? broadcast.segment_id} ·{" "}
                {broadcast.sent_at
                  ? formatDateTimeFull(new Date(broadcast.sent_at))
                  : "Not yet sent"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <BroadcastStatusBadge status={broadcast.status} />

              {analytics.isPending ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading analytics…
                </div>
              ) : analytics.isError || !analytics.data ? (
                <p className="py-8 text-center text-sm text-danger">
                  Couldn&apos;t load analytics for this broadcast.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border/50 bg-muted/10 p-3 text-center">
                    <Users className="mx-auto mb-1 size-4 text-muted-foreground" />
                    <p className="font-heading text-lg font-semibold text-foreground">
                      {analytics.data.delivered.toLocaleString("en-US")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Delivered
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-muted/10 p-3 text-center">
                    <CheckCircle2 className="mx-auto mb-1 size-4 text-signal" />
                    <p className="font-heading text-lg font-semibold text-foreground">
                      {analytics.data.opened.toLocaleString("en-US")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Opened</p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-muted/10 p-3 text-center">
                    <MousePointerClick className="mx-auto mb-1 size-4 text-primary" />
                    <p className="font-heading text-lg font-semibold text-foreground">
                      {analytics.data.clicked.toLocaleString("en-US")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Clicked</p>
                  </div>
                </div>
              )}

              {broadcast.preview_text && (
                <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
                  <p className="text-xs text-muted-foreground">Preview text</p>
                  <p className="text-sm text-foreground">
                    {broadcast.preview_text}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Send className="size-3.5" />
                From {broadcast.from_name ?? "Dugble"} &lt;
                {broadcast.from_email ?? "—"}&gt;
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
