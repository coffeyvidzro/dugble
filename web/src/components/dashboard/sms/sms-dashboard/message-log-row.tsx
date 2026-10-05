import Link from "next/link";
import { TableCell, TableRow } from "@/components/ui/table";
import type { SmsApiResource } from "@/types/sms-api";
import { countryCodeToFlag } from "../../shared/country-flag";
import { SmsStatusBadge } from "../../shared/sms-status-badge";
import { formatRelativeTime } from "./types";

export function MessageLogRow({ message }: { message: SmsApiResource }) {
  return (
    <TableRow className="border-b border-border/40 last:border-0">
      <TableCell className="p-0">
        <Link
          href={`/dashboard/sms/send/${message.id}`}
          className="block px-4 py-3 font-mono text-sm text-foreground transition-colors hover:text-primary"
        >
          <span className="mr-1.5">
            {countryCodeToFlag(message.destination.country)}
          </span>
          {message.to}
        </Link>
      </TableCell>
      <TableCell>
        <SmsStatusBadge status={message.last_event} />
      </TableCell>
      <TableCell className="max-w-md truncate text-sm text-muted-foreground">
        {message.body}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {message.segments}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatRelativeTime(message.created_at)}
      </TableCell>
    </TableRow>
  );
}
