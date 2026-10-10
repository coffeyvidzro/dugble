"use client";

import { Phone } from "lucide-react";
import { FilterDropdown } from "@/components/dashboard/shared/filter-dropdown";

export function HistorySenderFilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <FilterDropdown
      label="Sender"
      icon={Phone}
      value={value}
      defaultValue="all"
      onChange={onChange}
      options={[
        { value: "all", label: "All senders" },
        ...options.map((option) => ({
          value: option,
          label: option,
          mono: true,
        })),
      ]}
    />
  );
}
