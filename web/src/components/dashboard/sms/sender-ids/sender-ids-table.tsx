import { Eye } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { SenderIdStatusBadge } from "./sender-id-status-badge";
import { formatRelativeTime } from "../sms-dashboard/types";
import { SENDER_TYPE_LABEL, type SenderIdRequest } from "./types";

export function SenderIdsTable({
    requests,
    onViewRequest,
}: {
    requests: SenderIdRequest[];
    onViewRequest: (request: SenderIdRequest) => void;
}) {
    if (requests.length === 0) {
        return (
            <p className="py-16 text-center text-sm text-muted-foreground">
                No sender IDs match this filter yet.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                        <TableHead className="w-48">Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Messages</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-10 text-right" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.map((request) => (
                        <TableRow
                            key={request.id}
                            className="border-b border-border/40 last:border-0"
                        >
                            <TableCell className="font-mono text-sm text-foreground">
                                <span className="mr-1.5">{request.flag}</span>
                                {request.name}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {SENDER_TYPE_LABEL[request.type]}
                            </TableCell>
                            <TableCell>
                                <SenderIdStatusBadge status={request.status} />
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm text-foreground">
                                {request.messagesSent.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {formatRelativeTime(request.submittedAt)}
                            </TableCell>
                            <TableCell className="text-right">
                                <button
                                    type="button"
                                    onClick={() => onViewRequest(request)}
                                    aria-label={`View ${request.name}`}
                                    className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                                >
                                    <Eye className="size-3.5" />
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
