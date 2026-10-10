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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSenderIds } from "@/hooks/queries/use-sender-ids";
import { SenderIdStatusBadge } from "../sender-ids/sender-id-status-badge";

export function SenderNumbersCard() {
  const { data: senderIds, isPending, isError } = useSenderIds();

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Sender IDs</CardTitle>
          <CardDescription>
            Sender identities registered to send on your behalf.
          </CardDescription>
        </div>
        <Link
          href="/dashboard/sms/sender-ids"
          className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
        >
          Manage sender IDs
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      {isPending ? (
        <LoadingBlock label="Loading…" />
      ) : isError ? (
        <ErrorState title="Couldn't load sender IDs" />
      ) : !senderIds || senderIds.length === 0 ? (
        <p className="w-full py-16 text-center text-sm text-muted-foreground">
          No sender IDs added yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="w-48">Sender ID</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {senderIds.map((senderId) => (
                <TableRow
                  key={senderId.id}
                  className="border-b border-border/40 last:border-0"
                >
                  <TableCell className="font-mono text-sm text-foreground">
                    {senderId.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {senderId.country_code}
                  </TableCell>
                  <TableCell className="text-right">
                    <SenderIdStatusBadge status={senderId.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
