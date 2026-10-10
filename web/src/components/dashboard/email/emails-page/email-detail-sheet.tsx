"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/dashboard/shared/copy-button";
import { ErrorState } from "@/components/dashboard/shared/data-states";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmail, useEmailEvents } from "@/hooks/queries/use-emails-api";
import { formatDateTime } from "@/lib/format-date";
import { isTerminalEmailStatus } from "@/types/email-api";
import { EmailStatusBadge } from "../shared/email-status-badge";
import { EmailActions } from "./detail/email-actions";
import { EmailContentCard } from "./detail/email-content-card";
import { EmailMetaGrid } from "./detail/email-meta-grid";
import { EmailTimeline } from "./detail/email-timeline";

/**
 * Quick look at one email from the log, without leaving the list. Fetches
 * only when opened (the same queries the full detail page uses).
 */
export function EmailDetailSheet({
  emailId,
  onOpenChange,
}: {
  emailId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={emailId !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-[520px]">
        {emailId && <EmailDetailSheetBody emailId={emailId} />}
      </SheetContent>
    </Sheet>
  );
}

function EmailDetailSheetBody({ emailId }: { emailId: string }) {
  const emailQuery = useEmail(emailId);
  const eventsQuery = useEmailEvents(emailId);
  const email = emailQuery.data;
  const isTerminal = email ? isTerminalEmailStatus(email.last_event) : false;

  return (
    <>
      <SheetHeader className="gap-2 border-b px-5 pt-5 pr-14 pb-4">
        {email ? (
          <>
            <EmailStatusBadge status={email.last_event} size="md" />
            <SheetTitle className="font-heading text-lg leading-6 font-semibold">
              {email.subject}
            </SheetTitle>
            <SheetDescription className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
              <span className="inline-flex items-center gap-1 rounded-md border bg-muted/50 py-0.5 pr-0.5 pl-2 font-mono text-xs text-foreground">
                {email.id}
                <CopyButton value={email.id} label="email ID" />
              </span>
              <span suppressHydrationWarning>
                {formatDateTime(email.created_at)}
              </span>
            </SheetDescription>
          </>
        ) : (
          <>
            <SheetTitle className="sr-only">Email details</SheetTitle>
            <Skeleton className="h-[26px] w-28 rounded-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </>
        )}
      </SheetHeader>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {emailQuery.isError ? (
          <ErrorState
            title="Couldn't load this email"
            description="It may not exist, or you may not have access to it."
            onRetry={() => emailQuery.refetch()}
          />
        ) : !email ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            <EmailActions email={email} isTerminal={isTerminal} />
            <EmailTimeline
              events={eventsQuery.data?.data ?? []}
              isPolling={!isTerminal}
              isPending={eventsQuery.isPending}
            />
            <EmailMetaGrid email={email} />
            <EmailContentCard email={email} />
          </>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t px-5 py-3.5">
        <Link
          href={`/dashboard/email/emails/${emailId}`}
          className={buttonVariants({ className: "gap-1.5" })}
        >
          Open full page
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </>
  );
}
