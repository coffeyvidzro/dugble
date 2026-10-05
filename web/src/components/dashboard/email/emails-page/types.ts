import { EMAIL_API_STATUS_LABEL, type EmailApiStatus } from "@/types/email-api";

export type EmailApiStatusFilter = "all" | EmailApiStatus;

export const EMAIL_API_STATUS_FILTER_OPTIONS: {
  value: EmailApiStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "All statuses" },
  ...(Object.keys(EMAIL_API_STATUS_LABEL) as EmailApiStatus[]).map((id) => ({
    value: id as EmailApiStatusFilter,
    label: EMAIL_API_STATUS_LABEL[id],
  })),
];

export function matchesEmailApiStatusFilter(
  status: string,
  filter: EmailApiStatusFilter,
): boolean {
  return filter === "all" || status === filter;
}

export const EMAILS_LIST_PAGE_SIZE = 25;
