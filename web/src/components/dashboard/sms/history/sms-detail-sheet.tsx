"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import {
  ErrorState,
  TableSkeleton,
} from "@/components/dashboard/shared/data-states";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useSmsEvents, useSmsMessage } from "@/hooks/queries/use-sms-api";
import { isTerminalSmsStatus } from "@/types/sms-api";
import { MessageDetailSummary } from "../send-sms/message-detail-summary";
import { MessageStatusTimeline } from "../send-sms/message-status-timeline";

/**
 * Quick look at one SMS from the logs. Uses the same queries as the full
 * detail page, so an in-flight message keeps polling every 4s while open.
 */
export function SmsDetailSheet({
  messageId,
  onOpenChange,
}: {
  messageId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={messageId !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-[520px]">
        {messageId && <SmsDetailSheetBody messageId={messageId} />}
      </SheetContent>
    </Sheet>
  );
}

function SmsDetailSheetBody({ messageId }: { messageId: string }) {
  const messageQuery = useSmsMessage(messageId);
  const message = messageQuery.data;
  const isTerminal = message ? isTerminalSmsStatus(message.last_event) : false;
  const eventsQuery = useSmsEvents(messageId, { poll: !isTerminal });

  return (
    <>
      <SheetHeader className="gap-2 border-b px-5 pt-5 pr-14 pb-4">
        <SheetTitle className="font-heading text-lg leading-6 font-semibold">
          Message details
        </SheetTitle>
        <SheetDescription className="flex flex-wrap items-center gap-2 text-[13px]">
          {message && !isTerminal ? (
            <span className="inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs text-foreground">
              <span aria-hidden className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-signal opacity-60" />
                <span className="relative inline-flex size-full rounded-full bg-signal" />
              </span>
              Live, updates every 4s
            </span>
          ) : message ? (
            <span className="inline-flex h-6 items-center rounded-full border px-2.5 text-xs text-muted-foreground">
              Final status
            </span>
          ) : (
            <Skeleton className="h-6 w-36 rounded-full" />
          )}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {messageQuery.isError ? (
          <ErrorState
            title="Couldn't load this message"
            description="It may not exist, or you may not have access to it."
            onRetry={() => messageQuery.refetch()}
          />
        ) : !message ? (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : (
          <>
            <MessageDetailSummary message={message} />
            <section aria-labelledby="sms-sheet-timeline" className="space-y-3">
              <h3
                id="sms-sheet-timeline"
                className="font-heading text-sm font-semibold"
              >
                Delivery timeline
              </h3>
              {eventsQuery.isPending ? (
                <TableSkeleton
                  rows={3}
                  columns={["1rem", "minmax(0,1fr)", "5rem"]}
                />
              ) : (
                <MessageStatusTimeline
                  events={eventsQuery.data?.data ?? []}
                  isPolling={!isTerminal}
                />
              )}
            </section>
          </>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t px-5 py-3.5">
        <Link
          href={`/dashboard/sms/send/${messageId}`}
          className={buttonVariants({ className: "gap-1.5" })}
        >
          Open full page
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </>
  );
}
