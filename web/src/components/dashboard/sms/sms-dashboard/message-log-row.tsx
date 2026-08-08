import Link from "next/link";
import { TableCell, TableRow } from "@/components/ui/table";
import { SmsStatusBadge } from "./sms-status-badge";
import { ResendMessageButton } from "./resend-message-button";
import { formatRelativeTime, type SmsLogEntry, type SmsStatus } from "./types";

const RESENDABLE_STATUSES: SmsStatus[] = ["failed", "undelivered"];

export function MessageLogRow({
    message,
    onResend,
}: {
    message: SmsLogEntry;
    onResend: (id: string) => void;
}) {
    const canResend = RESENDABLE_STATUSES.includes(message.status);

    return (
        <TableRow className="border-b border-border/40 last:border-0">
            <TableCell className="p-0">
                <Link
                    href={`/dashboard/sms/send/${message.id}`}
                    className="block px-4 py-3 font-mono text-sm text-foreground transition-colors hover:text-primary"
                >
                    <span className="mr-1.5">{message.countryFlag}</span>
                    {message.to}
                </Link>
            </TableCell>
            <TableCell>
                <SmsStatusBadge status={message.status} />
            </TableCell>
            <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                {message.body}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {message.segments}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {formatRelativeTime(message.sentAt)}
            </TableCell>
            <TableCell className="text-right">
                {canResend && (
                    <ResendMessageButton
                        messageId={message.id}
                        onResend={onResend}
                    />
                )}
            </TableCell>
        </TableRow>
    );
}
