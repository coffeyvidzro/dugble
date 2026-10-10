"use client";

import { ArrowRight, MessageSquareOff } from "lucide-react";
import Link from "next/link";
import {
  ErrorState,
  LoadingBlock,
} from "@/components/dashboard/shared/data-states";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSmsMessages } from "@/hooks/queries/use-sms-api";
import { MessageLogRow } from "./message-log-row";

export function RecentMessagesCard() {
  const { data: messages, isPending, isError } = useSmsMessages({ limit: 5 });

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col items-start gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>
            The latest SMS sent from your workspace.
          </CardDescription>
        </div>
        <Link
          href="/dashboard/sms/history"
          className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
        >
          View all
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      {isPending ? (
        <LoadingBlock label="Loading…" />
      ) : isError ? (
        <ErrorState title="Couldn't load recent messages" />
      ) : messages?.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-dashed border-border bg-muted/50">
            <MessageSquareOff className="size-5 text-muted-foreground" />
          </div>
          <h3 className="mb-1 font-heading text-lg font-medium">
            No messages sent yet
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            SMS sent through the Dugble API will show up here as they go out.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="w-40">To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-20">Segments</TableHead>
                <TableHead className="w-24">Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages?.map((message) => (
                <MessageLogRow key={message.id} message={message} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
