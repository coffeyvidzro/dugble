import { Eye, Fingerprint, Trash2 } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/dashboard/shared/data-states";
import { buttonVariants } from "@/components/ui/button";
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
  filterLabel,
  onViewSenderId,
  onDeleteSenderId,
}: {
  senderIds: SenderId[];
  /** Active status filter, lowercase (e.g. "pending"); null for all. */
  filterLabel: string | null;
  onViewSenderId: (senderId: SenderId) => void;
  onDeleteSenderId: (senderId: SenderId) => void;
}) {
  if (senderIds.length === 0) {
    return filterLabel ? (
      <EmptyState
        icon={Fingerprint}
        title={`No ${filterLabel} sender IDs`}
        description="Try another status, or request a new sender ID."
      />
    ) : (
      <EmptyState
        icon={Fingerprint}
        title="No sender IDs yet"
        description="Request a sender ID so recipients see your brand name instead of a number."
        actions={
          <Link
            href="/dashboard/sms/sender-ids/new"
            className={buttonVariants()}
          >
            Request sender ID
          </Link>
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-56">Name</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {senderIds.map((senderId) => (
            <TableRow key={senderId.id}>
              <TableCell className="font-mono text-[13px] font-medium text-foreground">
                {senderId.name}
              </TableCell>
              <TableCell className="text-[13px] text-muted-foreground">
                {senderId.country_code}
              </TableCell>
              <TableCell>
                <SenderIdStatusBadge status={senderId.status} />
              </TableCell>
              <TableCell className="text-[13px] text-muted-foreground">
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
