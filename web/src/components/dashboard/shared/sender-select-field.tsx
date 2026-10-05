// src/components/dashboard/shared/sender-select-field.tsx

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SenderId } from "@/types/sender-id";

type SenderSelectFieldProps = {
  /** Approved sender IDs; the API expects the sender ID *name* as `from`. */
  senders: readonly SenderId[];
  value: string;
  onChange: (value: string) => void;
};

export function SenderSelectField({
  senders,
  value,
  onChange,
}: SenderSelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="sender">From</Label>
      <Select
        value={value}
        onValueChange={(next: string | null) => onChange(next ?? "")}
      >
        <SelectTrigger id="sender" className="w-full">
          <SelectValue placeholder="Choose a sender ID" />
        </SelectTrigger>
        <SelectContent>
          {senders.map((sender) => (
            <SelectItem key={sender.id} value={sender.name}>
              <span className="font-mono">{sender.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
