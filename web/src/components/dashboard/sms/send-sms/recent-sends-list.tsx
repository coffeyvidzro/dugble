// src/components/dashboard/sms/send-sms/recent-sends-list.tsx

"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSmsMessages } from "@/hooks/queries/use-sms-api";
import { countryCodeToFlag } from "../../shared/country-flag";
import { SmsStatusBadge } from "../../shared/sms-status-badge";

export function RecentSendsList() {
  const { data: sends, isPending, isError } = useSmsMessages({ limit: 5 });

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
        <CardTitle className="text-xl">Recently sent</CardTitle>
        <CardDescription>One-off messages sent from this page.</CardDescription>
      </CardHeader>

      {isPending ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading…
        </div>
      ) : isError ? (
        <p className="py-10 text-center text-sm text-danger">
          Couldn&apos;t load recent messages.
        </p>
      ) : sends?.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nothing sent yet. Your first message will show up here.
        </p>
      ) : (
        <ul className="divide-y divide-border/40">
          {sends?.map((send) => (
            <li key={send.id}>
              <Link
                href={`/dashboard/sms/send/${send.id}`}
                className="group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm text-foreground">
                    <span className="mr-1.5">
                      {countryCodeToFlag(send.destination.country)}
                    </span>
                    {send.to}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {send.body}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <SmsStatusBadge status={send.last_event} />
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {new Date(send.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
