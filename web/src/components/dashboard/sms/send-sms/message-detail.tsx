"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LoadingBlock } from "@/components/dashboard/shared/data-states";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSmsEvents, useSmsMessage } from "@/hooks/queries/use-sms-api";
import { isTerminalSmsStatus } from "@/types/sms-api";
import { MessageDetailSummary } from "./message-detail-summary";
import { MessageStatusTimeline } from "./message-status-timeline";

export function MessageDetail({ messageId }: { messageId: string }) {
  const messageQuery = useSmsMessage(messageId);
  const isTerminal = messageQuery.data
    ? isTerminalSmsStatus(messageQuery.data.last_event)
    : false;

  const eventsQuery = useSmsEvents(messageId, { poll: !isTerminal });

  if (messageQuery.isPending) {
    return (
      <LoadingBlock
        label="Loading message…"
        variant="page"
        className="mx-auto w-full max-w-3xl pb-6 pt-16"
      />
    );
  }

  if (messageQuery.isError || !messageQuery.data) {
    return (
      <div className="mx-auto w-full max-w-3xl pb-6">
        <div className="mb-6 space-y-1">
          <Link
            href="/dashboard/sms/send"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Send
          </Link>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" />
          Couldn&apos;t find that message. It may not exist, or you may not have
          access to it.
        </div>
      </div>
    );
  }

  const message = messageQuery.data;
  const events = eventsQuery.data?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl pb-6">
      <div className="mb-6 space-y-1">
        <Link
          href="/dashboard/sms/send"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Send
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Message details
        </h1>
      </div>

      <div className="space-y-6">
        <MessageDetailSummary message={message} />

        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle>Delivery timeline</CardTitle>
            <CardDescription>
              {isTerminal
                ? "Full delivery history for this message."
                : "Live status from the carrier feed."}
            </CardDescription>
          </CardHeader>
          <div className="p-4">
            {eventsQuery.isPending ? (
              <LoadingBlock label="Loading delivery events…" />
            ) : (
              <MessageStatusTimeline events={events} isPolling={!isTerminal} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
