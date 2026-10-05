// src/components/dashboard/email/emails-page/emails-table.tsx

import { Inbox } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EmailSummary } from "@/types/email-api";
import { EmailSummaryRow } from "./email-summary-row";
import { PaginationControls } from "./pagination-controls";

export function EmailsTable({
  emails,
  page,
  hasNextPage,
  onPageChange,
  hasActiveFilters,
}: {
  emails: EmailSummary[];
  page: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  hasActiveFilters: boolean;
}) {
  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
          <Inbox className="size-5 text-muted-foreground" />
        </div>
        <h3 className="mb-1 font-heading text-lg font-medium">
          {hasActiveFilters ? "No emails match your filters" : "No emails yet"}
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          {hasActiveFilters
            ? "Try adjusting your search or filters, or check the next page."
            : "Emails sent through the Dugble API will show up here."}
        </p>
      </div>
    );
  }

  return (
    <>
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
            {emails.map((email) => (
              <EmailSummaryRow key={email.id} email={email} />
            ))}
          </TableBody>
        </Table>
      </div>
      <PaginationControls
        page={page}
        itemCount={emails.length}
        hasNextPage={hasNextPage}
        onPageChange={onPageChange}
      />
    </>
  );
}
