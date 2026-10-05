// src/components/dashboard/email/emails-page/email-summary-row.tsx

import { ArrowUpRight, Copy, MoreVertical } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { formatRelativeTime } from "@/lib/format-date";
import type { EmailSummary } from "@/types/email-api";
import { EmailStatusBadge } from "../shared/email-status-badge";

export function EmailSummaryRow({ email }: { email: EmailSummary }) {
  const { copy } = useCopyToClipboard();
  return (
    <TableRow className="group border-b-0 transition-colors hover:bg-muted/30">
      <TableCell className="border-l-2 border-l-transparent transition-colors group-hover:border-l-signal/50">
        <Link
          href={`/dashboard/email/emails/${email.id}`}
          className="flex flex-col"
        >
          <span className="font-mono text-xs text-foreground">
            {email.to_email}
          </span>
          {email.to_name && (
            <span className="text-[11px] text-muted-foreground">
              {email.to_name}
            </span>
          )}
        </Link>
      </TableCell>
      <TableCell>
        <EmailStatusBadge status={email.status} />
      </TableCell>
      <TableCell className="max-w-[320px] truncate text-sm text-foreground">
        {email.subject}
      </TableCell>
      <TableCell
        className="text-sm text-muted-foreground"
        suppressHydrationWarning
      >
        {formatRelativeTime(email.created_at)}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`Actions for email to ${email.to_email}`}
              />
            }
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 shadow-lg">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => void copy(email.id)}
            >
              <Copy className="mr-2 size-4" />
              Copy email ID
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/email/emails/${email.id}`}
                className="flex items-center"
              >
                <ArrowUpRight className="mr-2 size-4" />
                View details
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
