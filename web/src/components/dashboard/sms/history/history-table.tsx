import type { ReactNode } from "react";
import { countryCodeToFlag } from "@/components/dashboard/shared/country-flag";
import { SmsStatusBadge } from "@/components/dashboard/shared/sms-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SmsApiResource } from "@/types/sms-api";

export function HistoryTable({
  messages,
  emptyState,
  selectedId,
  onOpen,
}: {
  messages: SmsApiResource[];
  /** Rendered instead of the table when there are no messages. */
  emptyState: ReactNode;
  selectedId?: string | null;
  onOpen: (messageId: string) => void;
}) {
  if (messages.length === 0) return emptyState;

  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-36">Status</TableHead>
          <TableHead className="w-48">To</TableHead>
          <TableHead>Message</TableHead>
          <TableHead className="w-36">Sender</TableHead>
          <TableHead className="w-24 text-right">Sent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {messages.map((message) => (
          <TableRow
            key={message.id}
            data-state={message.id === selectedId ? "selected" : undefined}
          >
            <TableCell>
              <SmsStatusBadge status={message.last_event} />
            </TableCell>
            <TableCell className="py-2">
              <button
                type="button"
                onClick={() => onOpen(message.id)}
                className="flex max-w-full items-center gap-1.5 rounded-sm text-left font-mono text-[13px] text-foreground hover:underline hover:decoration-foreground/30 hover:underline-offset-4"
              >
                <span className="shrink-0">
                  {countryCodeToFlag(message.destination.country)}
                </span>
                <span className="truncate">{message.to}</span>
              </button>
            </TableCell>
            <TableCell
              className="truncate text-[13px] text-muted-foreground"
              title={message.body}
            >
              {message.body}
            </TableCell>
            <TableCell className="truncate font-mono text-[13px] text-muted-foreground">
              {message.from}
            </TableCell>
            <TableCell
              className="text-right text-[13px] text-muted-foreground tabular-nums"
              suppressHydrationWarning
            >
              {new Date(message.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
