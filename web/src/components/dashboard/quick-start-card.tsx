"use client";

import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEmails } from "@/hooks/queries/use-emails-api";
import { useSmsMessages } from "@/hooks/queries/use-sms-api";
import { useTeamTokens } from "@/hooks/queries/use-team-tokens";
import { useTeam } from "@/hooks/queries/use-teams";
import { useWebhookEndpoints } from "@/hooks/queries/use-webhooks";
import { cn } from "@/lib/utils";
import { useActiveTeamId } from "@/store/active-team-store";

const PROBE = { limit: 1 } as const;

export function QuickStartCard() {
  const activeTeamId = useActiveTeamId();
  const { data: team } = useTeam(activeTeamId ?? "");
  const { data: tokens } = useTeamTokens();
  const { data: webhooks } = useWebhookEndpoints();
  const { data: emails } = useEmails(PROBE);
  const { data: sms } = useSmsMessages(PROBE);

  const hasTeam = Boolean(team);
  const hasToken = (tokens ?? []).some((token) => !token.revoked_at);
  const hasSentEmail = (emails?.length ?? 0) > 0;
  const hasSentSms = (sms?.length ?? 0) > 0;
  const hasWebhook = (webhooks?.length ?? 0) > 0;

  const quickStart = [
    {
      title: "Create team",
      href: "/dashboard/create-team",
      isComplete: hasTeam,
    },
    {
      title: "Create an API token",
      href: "/dashboard/developers/api-tokens",
      isComplete: hasToken,
    },
    {
      title: "Send email",
      href: "/dashboard/email/emails",
      isComplete: hasSentEmail,
    },
    {
      title: "Send SMS",
      href: "/dashboard/sms/send",
      isComplete: hasSentSms,
    },
    {
      title: "Configure webhook",
      href: "/dashboard/developers/webhooks",
      isComplete: hasWebhook,
    },
  ];

  const completed = quickStart.filter((step) => step.isComplete).length;

  const allDone = completed === quickStart.length;

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex items-baseline justify-between gap-3">
          <CardTitle>
            {allDone ? "Setup complete" : "Finish setting up"}
          </CardTitle>
          <span className="text-xs text-muted-foreground tabular-nums">
            {completed} of {quickStart.length} done
          </span>
        </div>
        <CardDescription>
          {allDone
            ? "Your workspace is ready to send."
            : "Complete these steps to send your first Dugble message."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          aria-hidden
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-signal transition-[width] duration-500"
            style={{ width: `${(completed / quickStart.length) * 100}%` }}
          />
        </div>
        <ul className="-mx-2">
          {quickStart.map((item) => (
            <li key={item.title}>
              <Link
                href={item.href}
                className="group flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/60"
              >
                {item.isComplete ? (
                  <CheckCircle2
                    aria-label="Done"
                    className="size-[18px] shrink-0 text-signal"
                  />
                ) : (
                  <Circle
                    aria-label="To do"
                    strokeDasharray="3 2.5"
                    className="size-[18px] shrink-0 text-muted-foreground/60"
                  />
                )}
                <span
                  className={cn(
                    "flex-1",
                    item.isComplete && "text-muted-foreground",
                  )}
                >
                  {item.title}
                </span>
                {!item.isComplete && (
                  <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
