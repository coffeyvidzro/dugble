"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LoadingBlock } from "@/components/dashboard/shared/data-states";
import { useEmail, useEmailEvents } from "@/hooks/queries/use-emails-api";
import { isTerminalEmailStatus } from "@/types/email-api";
import { EmailActions } from "./email-actions";
import { EmailContentCard } from "./email-content-card";
import { EmailDetailHeader } from "./email-detail-header";
import { EmailMetaGrid } from "./email-meta-grid";
import { EmailTimeline } from "./email-timeline";

export function EmailDetailView({ emailId }: { emailId: string }) {
  const emailQuery = useEmail(emailId);
  const isTerminal = emailQuery.data
    ? isTerminalEmailStatus(emailQuery.data.last_event)
    : false;
  const eventsQuery = useEmailEvents(emailId);

  if (emailQuery.isPending) {
    return (
      <LoadingBlock
        label="Loading email…"
        variant="page"
        className="mx-auto w-full max-w-5xl pb-6 pt-16"
      />
    );
  }

  if (emailQuery.isError || !emailQuery.data) {
    return (
      <div className="mx-auto w-full max-w-5xl pb-6">
        <Link
          href="/dashboard/email/emails"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Emails
        </Link>
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" />
          Couldn&apos;t find that email. It may not exist, or you may not have
          access to it.
        </div>
      </div>
    );
  }

  const email = emailQuery.data;
  const events = eventsQuery.data?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl pb-6">
      <div className="space-y-3">
        <Link
          href="/dashboard/email/emails"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Emails
        </Link>
        <EmailDetailHeader email={email} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <EmailMetaGrid email={email} />
          <EmailActions email={email} isTerminal={isTerminal} />
          <EmailTimeline
            events={events}
            isPolling={!isTerminal}
            isPending={eventsQuery.isPending}
          />
        </div>

        <div className="lg:col-span-1">
          <EmailContentCard email={email} />
        </div>
      </div>
    </div>
  );
}
