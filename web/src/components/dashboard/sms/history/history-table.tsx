import Link from "next/link";
import { Inbox } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { SmsStatusBadge } from "../sms-dashboard/sms-status-badge";
import { formatRelativeTime, type SmsLogEntry } from "../sms-dashboard/types";

export function HistoryTable({ messages }: { messages: SmsLogEntry[] }) {
    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-full border border-dashed border-border bg-muted/50">
                    <Inbox className="size-5 text-muted-foreground" />
                </span>
                <h3 className="font-heading text-lg font-medium text-foreground">
                    No messages found
                </h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                    Try adjusting your filters or search terms.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table className="table-fixed">
                <TableHeader>
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                        <TableHead className="w-36">To</TableHead>
                        <TableHead className="w-32">Sender</TableHead>
                        <TableHead className="w-28">Status</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="w-24 text-right">Sent</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {messages.map((message) => (
                        <TableRow
                            key={message.id}
                            className="border-b border-border/40 last:border-0"
                        >
                            <TableCell className="p-0">
                                <Link
                                    href={`/dashboard/sms/send/${message.id}`}
                                    className="flex items-center gap-1.5 truncate px-4 py-3 font-mono text-sm text-foreground transition-colors hover:text-primary"
                                >
                                    <span className="shrink-0">
                                        {message.countryFlag}
                                    </span>
                                    <span className="truncate">
                                        {message.to}
                                    </span>
                                </Link>
                            </TableCell>
                            <TableCell className="truncate font-mono text-sm text-muted-foreground">
                                {message.from}
                            </TableCell>
                            <TableCell className="truncate">
                                <SmsStatusBadge status={message.status} />
                            </TableCell>
                            <TableCell className="truncate text-sm text-muted-foreground">
                                {message.body}
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                                {formatRelativeTime(message.sentAt)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
