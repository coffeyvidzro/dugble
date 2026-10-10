import { ArrowUpRight, Copy, MoreHorizontal } from "lucide-react";
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

export function EmailSummaryRow({
  email,
  selected = false,
  onOpen,
}: {
  email: EmailSummary;
  selected?: boolean;
  /** Opens the detail sheet; without it the recipient links to the page. */
  onOpen?: (emailId: string) => void;
}) {
  const { copy } = useCopyToClipboard();
  const recipient = (
    <>
      <span className="block truncate font-mono text-[13px] text-foreground">
        {email.to_email}
      </span>
      {email.to_name && (
        <span className="block truncate text-xs text-muted-foreground">
          {email.to_name}
        </span>
      )}
    </>
  );

  return (
    <TableRow data-state={selected ? "selected" : undefined}>
      <TableCell>
        <EmailStatusBadge status={email.status} />
      </TableCell>
      <TableCell className="max-w-64 py-2">
        {onOpen ? (
          <button
            type="button"
            onClick={() => onOpen(email.id)}
            className="block max-w-full rounded-sm text-left hover:underline hover:decoration-foreground/30 hover:underline-offset-4"
          >
            {recipient}
          </button>
        ) : (
          <Link href={`/dashboard/email/emails/${email.id}`} className="block">
            {recipient}
          </Link>
        )}
      </TableCell>
      <TableCell className="max-w-[360px] truncate text-[13px] text-foreground">
        {email.subject}
      </TableCell>
      <TableCell
        className="text-right text-[13px] text-muted-foreground tabular-nums"
        suppressHydrationWarning
      >
        {formatRelativeTime(email.created_at)}
      </TableCell>
      <TableCell className="w-12 py-2 pr-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={`Actions for email to ${email.to_email}`}
              />
            }
          >
            <MoreHorizontal className="size-4" />
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
                Open full page
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
