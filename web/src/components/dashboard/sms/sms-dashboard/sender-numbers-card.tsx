import Link from "next/link";
import { ArrowRight, Clock, Signature, X, type LucideIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { SenderNumber, SenderNumberStatus } from "./types";
import { SENDER_TYPE_LABEL } from "./types";

const STATUS_CONFIG: Record<
    SenderNumberStatus,
    { label: string; icon: LucideIcon; className: string; pulse?: boolean }
> = {
    approved: { label: "Approved", icon: Signature, className: "text-signal" },
    pending: { label: "Pending review", icon: Clock, className: "text-pending", pulse: true },
    rejected: { label: "Rejected", icon: X, className: "text-danger" },
};

const CAPABILITY_LABEL: Record<SenderNumber["capability"], string> = {
    sms: "SMS only",
    sms_mms: "SMS + MMS",
};

function SenderStatusBadge({ status }: { status: SenderNumberStatus }) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium",
                config.className,
            )}
        >
            {config.pulse ? (
                <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pending opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-pending" />
                </span>
            ) : (
                <Icon className="size-3.5" />
            )}
            {config.label}
        </span>
    );
}

export function SenderNumbersCard({ numbers }: { numbers: SenderNumber[] }) {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="flex flex-col items-start gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-xl">Sender IDs</CardTitle>
                    <CardDescription>
                        Numbers and IDs registered to send on your behalf.
                    </CardDescription>
                </div>
                <Link
                    href="/dashboard/sms/sender-ids"
                    className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                >
                    Manage sender IDs
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                    />
                </Link>
            </CardHeader>

            {numbers.length === 0 ? (
                <p className="w-full py-16 text-center text-sm text-muted-foreground">
                    No sender IDs added yet.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                <TableHead className="w-48">Sender ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>Capability</TableHead>
                                <TableHead className="text-right">
                                    Status
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {numbers.map((sender) => (
                                <TableRow
                                    key={sender.id}
                                    className="border-b border-border/40 last:border-0"
                                >
                                    <TableCell className="font-mono text-sm text-foreground">
                                        {sender.number}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {SENDER_TYPE_LABEL[sender.type]}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        <span className="mr-1.5">
                                            {sender.flag}
                                        </span>
                                        {sender.country}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {CAPABILITY_LABEL[sender.capability]}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <SenderStatusBadge
                                            status={sender.status}
                                        />
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
