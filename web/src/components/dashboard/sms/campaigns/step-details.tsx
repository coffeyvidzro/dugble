import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApprovedSenderIds } from "@/hooks/queries/use-approved-sender-ids";
import { MessageField } from "../../shared/message-field";
import { calculateSegments } from "../../shared/sms-segments";
import { CampaignSenderSelectField } from "./campaign-sender-select-field";

export function StepDetails({
  name,
  onNameChange,
  senderId,
  onSenderIdChange,
  body,
  onBodyChange,
}: {
  name: string;
  onNameChange: (value: string) => void;
  senderId: string;
  onSenderIdChange: (value: string | null) => void;
  body: string;
  onBodyChange: (value: string) => void;
}) {
  const { data: approvedSenderIds, isPending } = useApprovedSenderIds();
  const segmentInfo = useMemo(() => calculateSegments(body), [body]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="campaign-name">Campaign name</Label>
        <Input
          id="campaign-name"
          placeholder="Monthly Billing Reminder"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          For your reference only — recipients never see this.
        </p>
      </div>

      {isPending ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading sender IDs…
        </div>
      ) : !approvedSenderIds || approvedSenderIds.length === 0 ? (
        <div className="rounded-lg border border-border/40 bg-muted/10 p-3 text-sm text-muted-foreground">
          You don&apos;t have an approved sender ID yet.{" "}
          <a
            href="/dashboard/sms/sender-ids/new"
            className="font-medium text-foreground underline underline-offset-2"
          >
            Request one
          </a>{" "}
          before building a campaign.
        </div>
      ) : (
        <CampaignSenderSelectField
          senderIds={approvedSenderIds}
          value={senderId}
          onChange={onSenderIdChange}
        />
      )}

      <MessageField
        value={body}
        onChange={onBodyChange}
        segmentInfo={segmentInfo}
      />
    </div>
  );
}
