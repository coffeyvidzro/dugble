import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/dashboard/shared/data-states";
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
  selectedId,
  onOpen,
}: {
  emails: EmailSummary[];
  page: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  hasActiveFilters: boolean;
  selectedId?: string | null;
  onOpen?: (emailId: string) => void;
}) {
  if (emails.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title={
          hasActiveFilters
            ? "No emails match your filters"
            : "No emails sent yet"
        }
        description={
          hasActiveFilters
            ? "Try a different search or status, or check the next page."
            : "Emails sent through the Dugble API will show up here."
        }
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-36">Status</TableHead>
              <TableHead className="w-64">To</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="w-28 text-right">Created</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => (
              <EmailSummaryRow
                key={email.id}
                email={email}
                selected={email.id === selectedId}
                onOpen={onOpen}
              />
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
