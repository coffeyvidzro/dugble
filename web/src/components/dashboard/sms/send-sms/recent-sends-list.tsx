"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  ErrorState,
  LoadingBlock,
} from "@/components/dashboard/shared/data-states";
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
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Recently sent</CardTitle>
        <CardDescription>One-off messages sent from this page.</CardDescription>
      </CardHeader>

      {isPending ? (
        <LoadingBlock label="Loading…" />
      ) : isError ? (
        <ErrorState title="Couldn't load recent messages" />
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
