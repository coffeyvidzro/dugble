// src/components/dashboard/recent-activity-card.tsx

"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { NoTeamState } from "@/components/dashboard/shared/no-team-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  href: string;
  createdAt: string;
  badge: React.ReactNode;
};

function ErrorState({
  compact,
  title,
  onRetry,
}: {
  compact?: boolean;
  title: string;
  onRetry: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 text-center",
        compact ? "min-h-40 py-8" : "py-10",
      )}
    >
      <p className="text-sm text-danger">{title}</p>
      <button
        type="button"
        onClick={onRetry}
        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
      >
        Try again
      </button>
    </div>
  );
}

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

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>
          The latest SMS and emails sent from your workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {!activeTeamId ? (
          <NoTeamState
            compact
            description="Create or select a team to see recent activity."
          />
        ) : (
          <>
            <div className="grid grid-cols-4 border-y bg-muted/20 px-3 py-2 font-mono text-[11px] text-muted-foreground sm:px-4">
              <span>Recipient</span>
              <span>Channel</span>
              <span>Status</span>
              <span className="text-right">Time</span>
            </div>

            {isPending ? (
              <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading…
              </div>
            ) : isError ? (
              <ErrorState
                compact
                title="Couldn't load recent activity"
                onRetry={() => {
                  smsQuery.refetch();
                  emailQuery.refetch();
                }}
              />
            ) : rows.length === 0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                <p className="text-sm font-medium">No messages yet</p>
                <p className="max-w-56 text-xs text-muted-foreground">
                  Send a test message to see it traced here in real time.
                </p>
              </div>
            ) : (
              <ul>
                {rows.map((row) => (
                  <li key={row.id} className="border-b last:border-0">
                    <Link
                      href={row.href}
                      className="grid grid-cols-4 items-center px-3 py-2.5 text-sm transition-colors hover:bg-muted/30 sm:px-4"
                    >
                      <span className="truncate font-mono text-xs text-foreground">
                        {row.recipient}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {row.channel}
                      </span>
                      <span>{row.badge}</span>
                      <span
                        className="text-right text-xs text-muted-foreground"
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
      </CardContent>
    </Card>
  );
}
