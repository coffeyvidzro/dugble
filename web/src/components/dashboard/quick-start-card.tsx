// src/components/dashboard/quick-start-card.tsx

"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
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

/** Smallest page that still answers "has this team sent anything yet?". */
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
      href: "/dashboard/settings/team",
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quick start</CardTitle>
          <span className="font-mono text-xs text-muted-foreground">
            {completed} of {quickStart.length} complete
          </span>
        </div>
        <CardDescription>
          Complete these steps to send your first Dugble message.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {quickStart.map((item) => (
            <li key={item.title}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl border p-3 text-sm transition-colors hover:border-signal/40",
                  item.isComplete && "bg-muted/30 border-transparent",
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground">
                  {item.isComplete ? (
                    <CheckCircle2 className="size-5 text-signal" />
                  ) : (
                    <span className="flex size-full items-center justify-center rounded-md border text-xs">
                      □
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "flex-1",
                    item.isComplete && "text-muted-foreground line-through",
                  )}
                >
                  {item.title}
                </span>
                {!item.isComplete && (
                  <ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
