// src/components/dashboard/sms/campaigns/campaign-builder-types.ts

// One-time send only — the Campaign API has no recurring-schedule contract.
export type CampaignScheduleMode = "now" | "later";
