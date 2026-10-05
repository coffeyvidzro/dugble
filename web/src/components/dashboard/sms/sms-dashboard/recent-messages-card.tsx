// src/components/dashboard/sms/sms-dashboard/recent-messages-card.tsx

"use client";

import { ArrowRight, Loader2, MessageSquareOff } from "lucide-react";
import Link from "next/link";
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
    <Card className="h-full border-border/40 shadow-sm">
      <CardHeader className="flex flex-col items-start gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl">Recent Messages</CardTitle>
          <CardDescription>
            The latest SMS sent from your workspace.
          </CardDescription>
        </div>
        <Link
          href="/dashboard/sms/history"
          className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
        >
          View all
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
          />
        </Link>
      </CardHeader>

      {isPending ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading…
        </div>
      ) : isError ? (
        <p className="py-16 text-center text-sm text-danger">
          Couldn&apos;t load recent messages.
        </p>
      ) : messages?.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-up">
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
