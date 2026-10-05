import { Copy, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteCampaign,
  useDuplicateCampaign,
} from "@/hooks/queries/use-campaigns-api";
import type { Campaign } from "@/types/campaign-api";
import type { Segment } from "@/types/segment";
import { formatDate } from "../sms-dashboard/types";
import { CampaignStatusBadge } from "./campaign-status-badge";

export function CampaignsTable({
  campaigns,
  segmentsById,
}: {
  campaigns: Campaign[];
  segmentsById: Map<string, Segment>;
}) {
  const duplicateCampaign = useDuplicateCampaign();
  const deleteCampaign = useDeleteCampaign();

  if (campaigns.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No campaigns match this filter yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/40 hover:bg-transparent">
            <TableHead className="w-56">Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Segment</TableHead>
            <TableHead className="text-right">Audience</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead className="w-20 text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const canDelete =
              campaign.status === "draft" || campaign.status === "canceled";
            const isDuplicating =
              duplicateCampaign.isPending &&
              duplicateCampaign.variables?.campaignId === campaign.id;
            const isDeleting =
              deleteCampaign.isPending &&
              deleteCampaign.variables === campaign.id;

            return (
              <TableRow
                key={campaign.id}
                className="group border-b border-border/40 last:border-0"
              >
                <TableCell className="p-0">
                  <Link
                    href={`/dashboard/sms/campaigns/${campaign.id}`}
                    className="block px-4 py-3 font-medium text-foreground transition-colors group-hover:text-primary"
                  >
                    {campaign.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <CampaignStatusBadge status={campaign.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {segmentsById.get(campaign.segment_id)?.name ??
                    campaign.segment_id}
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-foreground">
                  {campaign.audience_count.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {campaign.scheduled_at
                    ? formatDate(campaign.scheduled_at)
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        duplicateCampaign.mutate({
                          campaignId: campaign.id,
                        })
                      }
                      disabled={isDuplicating || isDeleting}
                      aria-label={`Duplicate ${campaign.name}`}
                      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-50"
                    >
                      {isDuplicating ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => deleteCampaign.mutate(campaign.id)}
                        disabled={isDuplicating || isDeleting}
                        aria-label={`Delete ${campaign.name}`}
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
