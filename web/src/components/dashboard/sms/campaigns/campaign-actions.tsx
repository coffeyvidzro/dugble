"use client";

import { AlertCircle, Loader2, Send, XCircle } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  useCancelCampaign,
  useScheduleCampaignByIdMutation,
  useSendCampaignByIdMutation,
} from "@/hooks/queries/use-campaigns-api";
import { errorMessage } from "@/lib/errors";
import { toDateTimeLocalValue } from "@/lib/format-date";
import type { Campaign } from "@/types/campaign-api";

export function CampaignActions({ campaign }: { campaign: Campaign }) {
  const sendCampaign = useSendCampaignByIdMutation();
  const scheduleCampaign = useScheduleCampaignByIdMutation();
  const cancelCampaign = useCancelCampaign(campaign.id);

  const [scheduling, setScheduling] = useState(false);
  const [sendAt, setSendAt] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const minDateTime = toDateTimeLocalValue(
    new Date(Date.now() + 60 * 60 * 1000),
  );

  const isBusy =
    sendCampaign.isPending ||
    scheduleCampaign.isPending ||
    cancelCampaign.isPending;

  function handleSendNow() {
    setActionError(null);
    sendCampaign.mutate(
      { campaignId: campaign.id },
      {
        onError: (error) =>
          setActionError(errorMessage(error, "Couldn't send the campaign.")),
      },
    );
  }

  function handleSchedule() {
    if (!sendAt) return;
    setActionError(null);
    scheduleCampaign.mutate(
      {
        campaignId: campaign.id,
        input: { scheduled_at: new Date(sendAt).toISOString() },
      },
      {
        onSuccess: () => setScheduling(false),
        onError: (error) =>
          setActionError(
            errorMessage(error, "Couldn't schedule the campaign."),
          ),
      },
    );
  }

  function handleCancel() {
    setActionError(null);
    cancelCampaign.mutate(undefined, {
      onError: (error) =>
        setActionError(errorMessage(error, "Couldn't cancel the campaign.")),
    });
  }

  if (campaign.status === "draft") {
    return (
      <div className="space-y-3">
        {actionError && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{actionError}</p>
          </div>
        )}
        {scheduling ? (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="datetime-local"
              value={sendAt}
              min={minDateTime}
              onChange={(event) => setSendAt(event.target.value)}
              className="w-auto"
            />
            <button
              type="button"
              onClick={handleSchedule}
              disabled={!sendAt || isBusy}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
            >
              {scheduleCampaign.isPending && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              Confirm schedule
            </button>
            <button
              type="button"
              onClick={() => setScheduling(false)}
              className="rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSendNow}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
            >
              {sendCampaign.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Send now
            </button>
            <button
              type="button"
              onClick={() => setScheduling(true)}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 disabled:pointer-events-none disabled:opacity-50"
            >
              Schedule
            </button>
          </div>
        )}
      </div>
    );
  }

  if (
    campaign.status === "scheduled" ||
    campaign.status === "queued" ||
    campaign.status === "sending"
  ) {
    return (
      <div className="space-y-3">
        {actionError && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{actionError}</p>
          </div>
        )}
        <button
          type="button"
          onClick={handleCancel}
          disabled={isBusy}
          className="inline-flex items-center gap-1.5 rounded-full border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:pointer-events-none disabled:opacity-50"
        >
          {cancelCampaign.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <XCircle className="size-3.5" />
          )}
          Cancel campaign
        </button>
      </div>
    );
  }

  return null;
}
