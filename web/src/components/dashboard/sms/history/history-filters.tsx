"use client";

import { CalendarDays } from "lucide-react";
import { FilterDropdown } from "@/components/dashboard/shared/filter-dropdown";
import { smsStatusTone } from "@/components/dashboard/shared/sms-status-badge";
import { StatusDot } from "@/components/dashboard/shared/status-badge";
import { HistorySearchInput } from "./history-search-input";
import { HistorySenderFilterSelect } from "./history-sender-filter-select";
import {
  HISTORY_DATE_FILTERS,
  HISTORY_DATE_LABEL,
  HISTORY_STATUS_FILTERS,
  HISTORY_STATUS_LABEL,
  type HistoryDateFilter,
  type HistoryStatusFilter,
} from "./types";

const STATUS_OPTIONS = HISTORY_STATUS_FILTERS.map((status) => ({
  value: status,
  label: status === "all" ? "All statuses" : HISTORY_STATUS_LABEL[status],
  mark:
    status === "all" ? undefined : <StatusDot tone={smsStatusTone(status)} />,
}));

const DATE_OPTIONS = HISTORY_DATE_FILTERS.map((range) => ({
  value: range,
  label: HISTORY_DATE_LABEL[range],
}));

export function HistoryFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  sender,
  onSenderChange,
  senderOptions,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  status: HistoryStatusFilter;
  onStatusChange: (status: HistoryStatusFilter) => void;
  dateRange: HistoryDateFilter;
  onDateRangeChange: (range: HistoryDateFilter) => void;
  sender: string;
  onSenderChange: (sender: string) => void;
  senderOptions: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <HistorySearchInput value={search} onChange={onSearchChange} />
      <FilterDropdown
        label="Status"
        value={status}
        defaultValue="all"
        options={STATUS_OPTIONS}
        onChange={onStatusChange}
        menuWidth="w-48"
      />
      <HistorySenderFilterSelect
        value={sender}
        onChange={onSenderChange}
        options={senderOptions}
      />
      <FilterDropdown
        label="Period"
        icon={CalendarDays}
        value={dateRange}
        defaultValue="30d"
        options={DATE_OPTIONS}
        onChange={onDateRangeChange}
        menuWidth="w-44"
      />
    </div>
  );
}
