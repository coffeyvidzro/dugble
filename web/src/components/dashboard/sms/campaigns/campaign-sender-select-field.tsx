import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SenderId } from "@/types/sender-id";

export function CampaignSenderSelectField({
  senderIds,
  value,
  onChange,
}: {
  senderIds: SenderId[];
  value: string;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="campaign-sender">From</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="campaign-sender" className="w-full">
          <SelectValue placeholder="Choose a sender ID" />
        </SelectTrigger>
        <SelectContent>
          {senderIds.map((senderId) => (
            <SelectItem key={senderId.id} value={senderId.id}>
              <span className="font-mono">{senderId.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
