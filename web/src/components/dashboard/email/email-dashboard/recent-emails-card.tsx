import Link from "next/link";

import { formatRelativeTime, type RecentEmail } from "./types";
import { ArrowRight, Inbox } from "lucide-react";
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
import { EmailStatusBadge } from "./email-status-badge";

export function RecentEmailsCard({ emails }: { emails: RecentEmail[] }) {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="flex flex-col items-start gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-xl">Recent Emails</CardTitle>
                    <CardDescription>
                        The latest transactional emails sent from your
                        workspace.
                    </CardDescription>
                </div>
                <Link
                    href="/dashboard/email/emails"
                    className="group/button relative inline-flex py-1.5 items-center justify-center gap-2 overflow-hidden rounded-full border bg-background px-4 font-mono text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                >
                    View all
                    <ArrowRight data-icon="inline-end" className="size-3.5" />
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                    />
                </Link>
            </CardHeader>

            {emails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
                        <Inbox className="size-5 text-muted-foreground" />
                    </div>
                    <h3 className="mb-1 font-heading text-lg font-medium">
                        No emails sent yet
                    </h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Emails sent through the Dugble API will show up here as
                        they go out.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                <TableHead className="w-56">To</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead className="text-right">
                                    Sent
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {emails.map((email) => (
                                <TableRow
                                    key={email.id}
                                    className="group border-b-0 transition-colors hover:bg-muted/30"
                                >
                                    <TableCell className="border-l-2 border-l-transparent font-mono text-xs text-foreground transition-colors group-hover:border-l-signal/50">
                                        {email.to}
                                    </TableCell>
                                    <TableCell>
                                        <EmailStatusBadge
                                            status={email.status}
                                        />
                                    </TableCell>
                                    <TableCell className="max-w-70 truncate text-sm text-foreground">
                                        {email.subject}
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-muted-foreground">
                                        {formatRelativeTime(email.sentAt)}
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
