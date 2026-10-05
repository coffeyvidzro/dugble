// src/components/dashboard/sms/sender-ids/sender-ids-table.tsx

import { Eye, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SenderId } from "@/types/sender-id";
import { formatDate } from "../sms-dashboard/types";
import { SenderIdStatusBadge } from "./sender-id-status-badge";

export function SenderIdsTable({
  senderIds,
  onViewSenderId,
  onDeleteSenderId,
}: {
  senderIds: SenderId[];
  onViewSenderId: (senderId: SenderId) => void;
  onDeleteSenderId: (senderId: SenderId) => void;
}) {
  if (senderIds.length === 0) {
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
            <TableHead>Country</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-20 text-right" />
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
              <TableCell>
                <SenderIdStatusBadge status={senderId.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(senderId.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onViewSenderId(senderId)}
                    aria-label={`View ${senderId.name}`}
                    className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  >
                    <Eye className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSenderId(senderId)}
                    aria-label={`Disable ${senderId.name}`}
                    className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
