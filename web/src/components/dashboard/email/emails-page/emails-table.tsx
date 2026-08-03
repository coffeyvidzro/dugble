import { Inbox } from "lucide-react";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { EmailLogRow } from "./email-log-row";
import { PaginationControls } from "./pagination-controls";
import type { EmailLogEntry } from "./types";

export function EmailsTable({
    emails,
    page,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    onResend,
    hasActiveFilters,
}: {
    emails: EmailLogEntry[];
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onResend: (email: EmailLogEntry) => void;
    hasActiveFilters: boolean;
}) {
    if (totalItems === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
                    <Inbox className="size-5 text-muted-foreground" />
                </div>
                <h3 className="mb-1 font-heading text-lg font-medium">
                    {hasActiveFilters
                        ? "No emails match your filters"
                        : "No emails yet"}
                </h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                    {hasActiveFilters
                        ? "Try adjusting your search or filters."
                        : "Emails sent through the Dugble API or dashboard will show up here."}
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
                            <TableHead className="w-32">Sent</TableHead>
                            <TableHead className="w-10 text-right" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {emails.map((email) => (
                            <EmailLogRow
                                key={email.id}
                                email={email}
                                onResend={onResend}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>
            <PaginationControls
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={onPageChange}
            />
        </>
    );
}
