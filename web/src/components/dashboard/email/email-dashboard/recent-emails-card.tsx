"use client";

import { ArrowRight, Inbox } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEmails } from "@/hooks/queries/use-emails-api";
import { EmailSummaryRow } from "../emails-page/email-summary-row";

export function RecentEmailsCard() {
  const { data: emails, isPending, isError } = useEmails({ limit: 5 });
  const list = emails ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Recent Emails</CardTitle>
          <CardDescription>
            The latest transactional emails sent from your workspace.
          </CardDescription>
        </div>
        <Link
          href="/dashboard/email/emails"
          className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
        >
          View all
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      {isPending ? (
        <LoadingBlock label="Loading…" />
      ) : isError ? (
        <ErrorState title="Couldn't load recent emails" />
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
            <Inbox className="size-5 text-muted-foreground" />
          </div>
          <h3 className="mb-1 font-heading text-lg font-medium">
            No emails sent yet
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Emails sent through the Dugble API will show up here as they go out.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="w-64">To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="w-32">Created</TableHead>
                <TableHead className="w-10 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((email) => (
                <EmailSummaryRow key={email.id} email={email} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
