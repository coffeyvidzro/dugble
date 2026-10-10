"use client";

import { Inbox } from "lucide-react";
import Link from "next/link";
import {
  EmptyState,
  ErrorState,
  RefetchBar,
  TableSkeleton,
} from "@/components/dashboard/shared/data-states";
import { NoTeamState } from "@/components/dashboard/shared/no-team-state";
import { Card } from "@/components/ui/card";
import { useEmails } from "@/hooks/queries/use-emails-api";
import { useSmsMessages } from "@/hooks/queries/use-sms-api";
import { formatRelativeTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { useActiveTeamId } from "@/store/active-team-store";
import { EmailStatusBadge } from "./email/shared/email-status-badge";
import { SmsStatusBadge } from "./shared/sms-status-badge";

type ActivityRow = {
  id: string;
  channel: "SMS" | "Email";
  recipient: string;
  preview: string;
  href: string;
  createdAt: string;
  badge: React.ReactNode;
};

export function RecentActivityCard() {
  const smsQuery = useSmsMessages({ limit: 5 });
  const emailQuery = useEmails({ limit: 5 });

  const activeTeamId = useActiveTeamId();

  const isPending = smsQuery.isPending || emailQuery.isPending;
  const isError = smsQuery.isError || emailQuery.isError;

  const rows: ActivityRow[] = [
    ...(smsQuery.data ?? []).map(
      (message): ActivityRow => ({
        id: `sms-${message.id}`,
        channel: "SMS",
        recipient: message.to,
        preview: message.body,
        href: `/dashboard/sms/send/${message.id}`,
        createdAt: message.created_at,
        badge: <SmsStatusBadge status={message.last_event} />,
      }),
    ),
    ...(emailQuery.data ?? []).map(
      (email): ActivityRow => ({
        id: `email-${email.id}`,
        channel: "Email",
        recipient: email.to_email,
        preview: email.subject,
        href: `/dashboard/email/emails/${email.id}`,
        createdAt: email.created_at,
        badge: <EmailStatusBadge status={email.status} />,
      }),
    ),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const isFetching = smsQuery.isFetching || emailQuery.isFetching;
  const columns =
    "grid grid-cols-[7.5rem_minmax(0,1fr)_4.5rem] items-center gap-4 px-5 md:grid-cols-[7.5rem_minmax(0,14rem)_4.5rem_minmax(0,1fr)_5.5rem]";

  return (
    <Card className="gap-0 py-0">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
        <div>
          <h2 className="font-heading text-base leading-6 font-semibold tracking-tight">
            Recent activity
          </h2>
          <p className="text-[13px] text-muted-foreground">
            The latest SMS and emails sent from your workspace.
          </p>
        </div>
        <div className="flex gap-4 text-[13px] font-medium">
          <Link
            href="/dashboard/sms/history"
            className="text-signal hover:underline"
          >
            SMS logs
          </Link>
          <Link
            href="/dashboard/email/emails"
            className="text-signal hover:underline"
          >
            Email logs
          </Link>
        </div>
      </div>
      {!activeTeamId ? (
        <NoTeamState
          compact
          className="border-t"
          description="Create or select a team to see recent activity."
        />
      ) : (
        <>
          <div
            className={cn(
              columns,
              "h-10 border-y bg-muted/40 font-mono text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase",
            )}
          >
            <span>Status</span>
            <span>Recipient</span>
            <span className="hidden md:block">Channel</span>
            <span className="hidden md:block">Preview</span>
            <span className="text-right">Time</span>
          </div>
          <RefetchBar active={isFetching && !isPending} />
          {isPending ? (
            <TableSkeleton
              rows={5}
              columns={["7rem", "minmax(0,1fr)", "minmax(0,2fr)", "4rem"]}
            />
          ) : isError ? (
            <ErrorState
              title="Couldn't load recent activity"
              onRetry={() => {
                smsQuery.refetch();
                emailQuery.refetch();
              }}
            />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No messages yet"
              description="Send a test message to see it traced here in real time."
            />
          ) : (
            <ul>
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="border-b border-border/60 last:border-0"
                >
                  <Link
                    href={row.href}
                    className={cn(
                      columns,
                      "h-11 text-[13px] transition-colors hover:bg-muted/50",
                    )}
                  >
                    <span>{row.badge}</span>
                    <span className="truncate font-mono text-xs">
                      {row.recipient}
                    </span>
                    <span className="hidden text-muted-foreground md:block">
                      {row.channel}
                    </span>
                    <span className="hidden truncate text-muted-foreground md:block">
                      {row.preview}
                    </span>
                    <span
                      className="text-right text-muted-foreground tabular-nums"
                      suppressHydrationWarning
                    >
                      {formatRelativeTime(row.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}
